import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def load_and_clean_data(csv_path='creditcard.csv', test_size=0.2, random_state=42):
    """Load and preprocess the credit card dataset.

    - Expects a 'Class' column as the target label.
    - Scales 'Amount' and 'Time' if present.
    Returns: X_train, X_test, y_train, y_test
    """
    df = pd.read_csv(csv_path)
    df = df.dropna()

    if 'Class' not in df.columns:
        raise ValueError("Dataset must contain a 'Class' column for labels")

    X = df.drop('Class', axis=1).copy()
    y = df['Class']

    scaler = StandardScaler()
    for col in ['Amount', 'Time']:
        if col in X.columns:
            X[col] = scaler.fit_transform(X[[col]])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, stratify=y, random_state=random_state
    )

    return X_train, X_test, y_train, y_test


if __name__ == "__main__":
    X_train, X_test, y_train, y_test = load_and_clean_data('creditcard.csv')
    print("Data loaded and split successfully.")
    print(f"Train: {X_train.shape}, Test: {X_test.shape}")