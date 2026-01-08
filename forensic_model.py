from sklearn.ensemble import RandomForestClassifier
import joblib # For saving the model

class FraudModel:
    def __init__(self):
        # We use 'balanced' to handle the 0.1% fraud rate efficiently
        self.model = RandomForestClassifier(
            n_estimators=100,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )

    def train(self, X_train, y_train):
        print("Model training in progress...")
        self.model.fit(X_train, y_train)
        print("Training complete.")
    def save_model(self, filename='fraud_model.joblib'):
        joblib.dump(self.model, filename)
        print(f"Model saved as {filename}")

    def load_model(self, filename='fraud_model.joblib'):
        self.model = joblib.load(filename)
        print(f"Model {filename} loaded successfully.")
    def get_evidence(self, features):
        # Extracts which digital artifacts were most suspicious
        importances = self.model.feature_importances_
        feature_map = dict(zip(features, importances))
        # Sort by most important
        return sorted(feature_map.items(), key=lambda x: x[1], reverse=True)[:5]

    def predict(self, X_test):
        return self.model.predict(X_test)

    def predict_with_threshold(self, X_test, threshold=0.5):
        # Instead of 0 or 1, we get the actual probability
        probs = self.model.predict_proba(X_test)[:, 1]
        return (probs >= threshold).astype(int) 
    
if __name__ == "__main__":
    print("Forensic Model Engine Ready.")