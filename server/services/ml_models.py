import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import joblib
import os

class MLModelTrainer:
    def __init__(self):
        self.models = {}
        self.model_performance = {}
        
    def prepare_data(self, data):
        """Prepare data for ML training"""
        # Add technical indicators
        data['SMA_20'] = data['Close'].rolling(window=20).mean()
        data['SMA_50'] = data['Close'].rolling(window=50).mean()
        data['RSI'] = self.calculate_rsi(data['Close'])
        data['Volatility'] = data['Close'].rolling(window=20).std()
        data['Returns'] = data['Close'].pct_change()
        
        # Create lagged features
        for i in range(1, 6):
            data[f'Close_lag_{i}'] = data['Close'].shift(i)
            data[f'Returns_lag_{i}'] = data['Returns'].shift(i)
        
        # Drop NaN values
        data = data.dropna()
        
        # Prepare features and target
        feature_cols = [col for col in data.columns if col not in ['Close', 'Date']]
        X = data[feature_cols]
        y = data['Close'].shift(-1).dropna()  # Predict next day's price
        X = X[:-1]  # Align with y
        
        return X, y
    
    def calculate_rsi(self, prices, window=14):
        """Calculate Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def train_random_forest(self, X, y):
        """Train Random Forest model"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        
        # Predictions and metrics
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        accuracy = max(0, min(100, (1 - np.sqrt(mse) / np.mean(y_test)) * 100))
        
        self.models['Random Forest'] = model
        self.model_performance['Random Forest'] = {
            'accuracy': accuracy,
            'mse': mse,
            'r2': r2
        }
        
        return model, {'accuracy': accuracy, 'mse': mse, 'r2': r2}
    
    def train_xgboost(self, X, y):
        """Train XGBoost model"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        
        # Predictions and metrics
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        accuracy = max(0, min(100, (1 - np.sqrt(mse) / np.mean(y_test)) * 100))
        
        self.models['XGBoost'] = model
        self.model_performance['XGBoost'] = {
            'accuracy': accuracy,
            'mse': mse,
            'r2': r2
        }
        
        return model, {'accuracy': accuracy, 'mse': mse, 'r2': r2}
    
    def prepare_lstm_data(self, X, y, time_steps=60):
        """Prepare data for LSTM model"""
        X_lstm = []
        y_lstm = []
        
        for i in range(time_steps, len(X)):
            X_lstm.append(X.iloc[i-time_steps:i].values)
            y_lstm.append(y.iloc[i])
        
        return np.array(X_lstm), np.array(y_lstm)
    
    def train_lstm(self, X, y):
        """Train LSTM model"""
        # Prepare LSTM data
        X_lstm, y_lstm = self.prepare_lstm_data(X, y)
        
        # Split data
        train_size = int(len(X_lstm) * 0.8)
        X_train = X_lstm[:train_size]
        X_test = X_lstm[train_size:]
        y_train = y_lstm[:train_size]
        y_test = y_lstm[train_size:]
        
        # Build LSTM model
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
        
        # Train model
        model.fit(X_train, y_train, batch_size=32, epochs=50, validation_split=0.1, verbose=0)
        
        # Predictions and metrics
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        accuracy = max(0, min(100, (1 - np.sqrt(mse) / np.mean(y_test)) * 100))
        
        self.models['LSTM'] = model
        self.model_performance['LSTM'] = {
            'accuracy': accuracy,
            'mse': mse,
            'r2': r2
        }
        
        return model, {'accuracy': accuracy, 'mse': mse, 'r2': r2}
    
    def train_all_models(self, data):
        """Train all ML models"""
        X, y = self.prepare_data(data)
        
        results = {}
        
        # Train Random Forest
        try:
            rf_model, rf_metrics = self.train_random_forest(X, y)
            results['Random Forest'] = rf_metrics
        except Exception as e:
            print(f"Error training Random Forest: {e}")
        
        # Train XGBoost
        try:
            xgb_model, xgb_metrics = self.train_xgboost(X, y)
            results['XGBoost'] = xgb_metrics
        except Exception as e:
            print(f"Error training XGBoost: {e}")
        
        # Train LSTM
        try:
            lstm_model, lstm_metrics = self.train_lstm(X, y)
            results['LSTM'] = lstm_metrics
        except Exception as e:
            print(f"Error training LSTM: {e}")
        
        return results
    
    def save_models(self, model_dir='models'):
        """Save trained models"""
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)
        
        for name, model in self.models.items():
            if name == 'LSTM':
                model.save(os.path.join(model_dir, f'{name.lower()}_model.h5'))
            else:
                joblib.dump(model, os.path.join(model_dir, f'{name.lower()}_model.pkl'))
    
    def load_models(self, model_dir='models'):
        """Load saved models"""
        if os.path.exists(model_dir):
            # Load traditional ML models
            for model_name in ['random_forest', 'xgboost']:
                model_path = os.path.join(model_dir, f'{model_name}_model.pkl')
                if os.path.exists(model_path):
                    self.models[model_name.replace('_', ' ').title()] = joblib.load(model_path)
            
            # Load LSTM model (would need TensorFlow)
            # lstm_path = os.path.join(model_dir, 'lstm_model.h5')
            # if os.path.exists(lstm_path):
            #     from tensorflow.keras.models import load_model
            #     self.models['LSTM'] = load_model(lstm_path)
    
    def predict(self, model_name, data):
        """Make predictions using specified model"""
        if model_name in self.models:
            if model_name == 'LSTM':
                # Special handling for LSTM
                X_lstm, _ = self.prepare_lstm_data(data, data['Close'])
                return self.models[model_name].predict(X_lstm[-1:])
            else:
                X, _ = self.prepare_data(data)
                return self.models[model_name].predict(X.tail(1))
        else:
            raise ValueError(f"Model {model_name} not found")
    
    def get_model_performance(self):
        """Get performance metrics for all models"""
        return self.model_performance

# Example usage
if __name__ == "__main__":
    # This would be called from the Flask backend
    trainer = MLModelTrainer()
    
    # Sample data preparation (in real implementation, load from CSV/database)
    # results = trainer.train_all_models(stock_data)
    # trainer.save_models()
    
    print("ML models training completed")
