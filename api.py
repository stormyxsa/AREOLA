from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the brain
model = joblib.load('forensic_fraud_model.joblib')

def analyze_dataframe(df: pd.DataFrame):
    # 1. CLEAN HEADERS
    # Removes quotes and leading/trailing spaces from CSV headers
    df.columns = [str(c).replace('"', '').strip() for c in df.columns]
    
    # 2. RETAIL-TO-FORENSIC MAPPING
    # This maps your new CSV headers (amt, unix_time) to what the model expects (Amount, Time)
    rename_map = {
        'amt': 'Amount', 
        'unix_time': 'Time', 
        'trans_date_trans_time': 'Time',
        'is_fraud': 'Class'
    }
    df = df.rename(columns=rename_map)
    
    # 3. FEATURE ALIGNMENT
    expected_features = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']
    
    # Prepare clean feature set for the model
    features = pd.DataFrame(index=df.index)
    for col in expected_features:
        if col in df.columns:
            features[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)
        else:
            # If V1-V28 are missing (common in retail CSVs), we use 0.0
            features[col] = 0.0 
    
    features = features[expected_features]

    # 4. RUN PREDICTIONS
    # model.predict_proba returns [prob_safe, prob_fraud]
    probs = model.predict_proba(features)[:, 1]
    
    df_result = df.copy()
    df_result['risk_score'] = (probs * 100).astype(int)
    
    print(f"Max Risk Score found: {df_result['risk_score'].max()}%")

    # 5. FILTER
    # Lowered threshold to 5 so you can see results even if PCA features are missing
    frauds = df_result[df_result['risk_score'] > 5].sort_values(by='risk_score', ascending=False)
    
    # 6. CALCULATE METRICS
    if not frauds.empty:
        # Robust number cleaning for 'Amount'
        numeric_amounts = pd.to_numeric(
            frauds['Amount'].astype(str).str.replace(r'[$,]', '', regex=True), 
            errors='coerce'
        ).fillna(0.0)
        total_exposure = float(numeric_amounts.sum())
    else:
        total_exposure = 0.0
    
    # 7. FORMAT FOR FRONTEND
    summary_list = []
    for _, row in frauds.iterrows():
        try:
            # If it's a retail CSV, use the Merchant name. If forensic, use the TXN ID.
            display_id = row.get('merchant', f"TXN-{int(float(row.get('Time', 0)))}")
            
            # Use Category as the "Artifact" if available
            artifact_label = str(row.get('category', 'V14' if float(row.get('V14', 0)) < -2 else 'V17')).upper()
            
            amt_str = str(row.get('Amount', '0')).replace('$', '').replace(',', '')
            amt = float(amt_str) if amt_str else 0.0
            
            summary_list.append({
                "id": str(display_id), 
                "amount": f"${amt:,.2f}",
                "score": int(row['risk_score']),
                "artifact": artifact_label
            })
        except:
            continue
        
    return {
        "totalScanned": int(len(df)),
        "foundCount": len(frauds),
        "totalExposure": round(total_exposure, 2),
        "avgExposure": round(total_exposure / len(frauds), 2) if len(frauds) > 0 else 0,
        "anomalies": summary_list
    }

@app.post("/upload_sweep")
async def upload_sweep(file: UploadFile = File(...)):
    contents = await file.read()
    # Read the CSV with flexible quoting
    uploaded_df = pd.read_csv(io.BytesIO(contents), quotechar='"', skipinitialspace=True)
    return analyze_dataframe(uploaded_df)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)