from data_processor import load_and_clean_data
from forensic_model import FraudModel
from sklearn.metrics import classification_report, confusion_matrix

def run_investigation():
    # 1. Process Data
    # Ensure 'creditcard.csv' is in your project folder!
    X_train, X_test, y_train, y_test = load_and_clean_data('creditcard.csv')
    
    # 2. Initialize and Train
    engine = FraudModel()
    engine.train(X_train, y_train)
    
    # 4. SAVE THE MODEL
    engine.save_model('forensic_fraud_model.joblib')
    
    print("\nModel is now a permanent asset (.joblib file).")
    
    # 3. Analyze Results
    predictions = engine.predict(X_test)
    
    print("\n--- FORENSIC ANALYSIS REPORT ---")
    print(classification_report(y_test, predictions))
    
    # 4. Show the Evidence (Uniqueness factor)
    print("\n--- TOP 5 FORENSIC ARTIFACTS (Why it flagged fraud) ---")
    evidence = engine.get_evidence(X_train.columns)
    for feature, score in evidence:
        print(f"Artifact: {feature} | Impact Score: {round(score, 4)}")

if __name__ == "__main__":
    run_investigation()