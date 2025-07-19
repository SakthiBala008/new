import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class DataProcessor:
    def __init__(self):
        self.data = None
        self.processed_data = None
        
    def load_stock_data(self, symbols: List[str], 
                       start_date: str = None, 
                       end_date: str = None) -> pd.DataFrame:
        """
        Load stock data from various sources
        """
        if start_date is None:
            start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')
        if end_date is None:
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        try:
            # Try to load from yfinance for Indian stocks
            indian_symbols = [f"{symbol}.NS" if not symbol.endswith('.NS') else symbol 
                            for symbol in symbols if symbol not in ['GOLD', 'CASH']]
            
            stock_data = {}
            
            for symbol in indian_symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(start=start_date, end=end_date)
                    if not hist.empty:
                        clean_symbol = symbol.replace('.NS', '')
                        stock_data[clean_symbol] = hist['Close']
                except Exception as e:
                    print(f"Error loading {symbol}: {e}")
                    continue
            
            # Add synthetic data for GOLD and CASH if requested
            if 'GOLD' in symbols:
                stock_data['GOLD'] = self._generate_gold_prices(start_date, end_date)
            
            if 'CASH' in symbols:
                stock_data['CASH'] = self._generate_cash_returns(start_date, end_date)
            
            # Combine all data
            if stock_data:
                combined_data = pd.DataFrame(stock_data)
                combined_data = combined_data.dropna()
                self.data = combined_data
                return combined_data
            else:
                # Fallback to synthetic data
                return self._generate_synthetic_data(symbols, start_date, end_date)
                
        except Exception as e:
            print(f"Error loading stock data: {e}")
            # Fallback to synthetic data
            return self._generate_synthetic_data(symbols, start_date, end_date)
    
    def _generate_gold_prices(self, start_date: str, end_date: str) -> pd.Series:
        """Generate synthetic gold price data"""
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # Start with base gold price
        base_price = 5200  # INR per gram
        
        # Generate price movements
        np.random.seed(42)
        daily_returns = np.random.normal(0.0002, 0.015, len(dates))  # Low volatility for gold
        
        prices = [base_price]
        for ret in daily_returns[1:]:
            prices.append(prices[-1] * (1 + ret))
        
        return pd.Series(prices, index=dates, name='GOLD')
    
    def _generate_cash_returns(self, start_date: str, end_date: str) -> pd.Series:
        """Generate cash equivalent returns (fixed deposits)"""
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # 6% annual return for cash (fixed deposits)
        daily_rate = 0.06 / 365
        base_value = 100
        
        # Compound daily
        values = [base_value * (1 + daily_rate) ** i for i in range(len(dates))]
        
        return pd.Series(values, index=dates, name='CASH')
    
    def _generate_synthetic_data(self, symbols: List[str], 
                                start_date: str, end_date: str) -> pd.DataFrame:
        """Generate synthetic stock data for demonstration"""
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        np.random.seed(42)
        
        # Base prices for Indian stocks
        base_prices = {
            'TCS': 3200, 'RIL': 2400, 'INFY': 1500, 'HDFCBANK': 1600,
            'WIPRO': 400, 'ICICIBANK': 900, 'LT': 2000, 'BHARTIARTL': 800,
            'GOLD': 5200, 'CASH': 100
        }
        
        # Volatilities (annual)
        volatilities = {
            'TCS': 0.25, 'RIL': 0.30, 'INFY': 0.28, 'HDFCBANK': 0.35,
            'WIPRO': 0.32, 'ICICIBANK': 0.38, 'LT': 0.30, 'BHARTIARTL': 0.28,
            'GOLD': 0.20, 'CASH': 0.02
        }
        
        # Annual drifts (expected returns)
        drifts = {
            'TCS': 0.12, 'RIL': 0.10, 'INFY': 0.14, 'HDFCBANK': 0.08,
            'WIPRO': 0.10, 'ICICIBANK': 0.09, 'LT': 0.11, 'BHARTIARTL': 0.08,
            'GOLD': 0.06, 'CASH': 0.06
        }
        
        stock_data = {}
        
        for symbol in symbols:
            if symbol in base_prices:
                # Generate price series
                n_days = len(dates)
                daily_vol = volatilities[symbol] / np.sqrt(252)
                daily_drift = drifts[symbol] / 252
                
                # Generate random walks
                returns = np.random.normal(daily_drift, daily_vol, n_days)
                
                # Convert to prices
                prices = [base_prices[symbol]]
                for ret in returns[1:]:
                    prices.append(prices[-1] * (1 + ret))
                
                stock_data[symbol] = pd.Series(prices, index=dates)
        
        self.data = pd.DataFrame(stock_data)
        return self.data
    
    def calculate_returns(self, price_data: pd.DataFrame = None) -> pd.DataFrame:
        """Calculate daily returns from price data"""
        if price_data is None:
            price_data = self.data
        
        if price_data is None:
            raise ValueError("No price data available")
        
        returns = price_data.pct_change().dropna()
        return returns
    
    def calculate_technical_indicators(self, price_data: pd.DataFrame = None) -> pd.DataFrame:
        """Calculate technical indicators"""
        if price_data is None:
            price_data = self.data
        
        if price_data is None:
            raise ValueError("No price data available")
        
        indicators = pd.DataFrame(index=price_data.index)
        
        for column in price_data.columns:
            prices = price_data[column]
            
            # Simple Moving Averages
            indicators[f'{column}_SMA_20'] = prices.rolling(window=20).mean()
            indicators[f'{column}_SMA_50'] = prices.rolling(window=50).mean()
            indicators[f'{column}_SMA_200'] = prices.rolling(window=200).mean()
            
            # Exponential Moving Average
            indicators[f'{column}_EMA_12'] = prices.ewm(span=12).mean()
            indicators[f'{column}_EMA_26'] = prices.ewm(span=26).mean()
            
            # MACD
            indicators[f'{column}_MACD'] = (indicators[f'{column}_EMA_12'] - 
                                          indicators[f'{column}_EMA_26'])
            indicators[f'{column}_MACD_Signal'] = indicators[f'{column}_MACD'].ewm(span=9).mean()
            
            # RSI
            indicators[f'{column}_RSI'] = self._calculate_rsi(prices)
            
            # Bollinger Bands
            sma_20 = indicators[f'{column}_SMA_20']
            std_20 = prices.rolling(window=20).std()
            indicators[f'{column}_BB_Upper'] = sma_20 + (std_20 * 2)
            indicators[f'{column}_BB_Lower'] = sma_20 - (std_20 * 2)
            
            # Volatility (20-day rolling)
            returns = prices.pct_change()
            indicators[f'{column}_Volatility'] = returns.rolling(window=20).std() * np.sqrt(252)
            
            # Price momentum
            indicators[f'{column}_Momentum_10'] = prices / prices.shift(10) - 1
            indicators[f'{column}_Momentum_30'] = prices / prices.shift(30) - 1
        
        return indicators.dropna()
    
    def _calculate_rsi(self, prices: pd.Series, window: int = 14) -> pd.Series:
        """Calculate Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_correlation_matrix(self, returns_data: pd.DataFrame = None) -> pd.DataFrame:
        """Calculate correlation matrix of returns"""
        if returns_data is None:
            if self.data is None:
                raise ValueError("No data available")
            returns_data = self.calculate_returns()
        
        return returns_data.corr()
    
    def calculate_covariance_matrix(self, returns_data: pd.DataFrame = None) -> pd.DataFrame:
        """Calculate covariance matrix of returns (annualized)"""
        if returns_data is None:
            if self.data is None:
                raise ValueError("No data available")
            returns_data = self.calculate_returns()
        
        return returns_data.cov() * 252  # Annualized
    
    def get_summary_statistics(self, returns_data: pd.DataFrame = None) -> Dict:
        """Get summary statistics for the data"""
        if returns_data is None:
            if self.data is None:
                raise ValueError("No data available")
            returns_data = self.calculate_returns()
        
        summary = {}
        for column in returns_data.columns:
            returns = returns_data[column]
            
            summary[column] = {
                'mean_return': returns.mean() * 252,  # Annualized
                'volatility': returns.std() * np.sqrt(252),  # Annualized
                'skewness': returns.skew(),
                'kurtosis': returns.kurtosis(),
                'sharpe_ratio': (returns.mean() * 252 - 0.06) / (returns.std() * np.sqrt(252)),
                'max_drawdown': self._calculate_max_drawdown(returns),
                'var_95': returns.quantile(0.05),
                'var_99': returns.quantile(0.01)
            }
        
        return summary
    
    def _calculate_max_drawdown(self, returns: pd.Series) -> float:
        """Calculate maximum drawdown"""
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        return drawdown.min()
    
    def prepare_ml_features(self, price_data: pd.DataFrame = None, 
                           lookback_period: int = 30) -> pd.DataFrame:
        """Prepare features for machine learning models"""
        if price_data is None:
            price_data = self.data
        
        if price_data is None:
            raise ValueError("No price data available")
        
        # Calculate returns
        returns = self.calculate_returns(price_data)
        
        # Calculate technical indicators
        indicators = self.calculate_technical_indicators(price_data)
        
        # Create lagged features
        features = pd.DataFrame(index=price_data.index)
        
        for column in price_data.columns:
            # Price features
            features[f'{column}_price'] = price_data[column]
            features[f'{column}_returns'] = returns[column]
            
            # Lagged returns
            for lag in range(1, lookback_period + 1):
                features[f'{column}_returns_lag_{lag}'] = returns[column].shift(lag)
            
            # Moving averages ratios
            if f'{column}_SMA_20' in indicators.columns:
                features[f'{column}_price_sma20_ratio'] = (price_data[column] / 
                                                         indicators[f'{column}_SMA_20'])
            
            if f'{column}_SMA_50' in indicators.columns:
                features[f'{column}_price_sma50_ratio'] = (price_data[column] / 
                                                         indicators[f'{column}_SMA_50'])
            
            # Volatility features
            if f'{column}_Volatility' in indicators.columns:
                features[f'{column}_volatility'] = indicators[f'{column}_Volatility']
            
            # RSI
            if f'{column}_RSI' in indicators.columns:
                features[f'{column}_rsi'] = indicators[f'{column}_RSI']
            
            # Momentum features
            if f'{column}_Momentum_10' in indicators.columns:
                features[f'{column}_momentum_10'] = indicators[f'{column}_Momentum_10']
        
        # Add market-wide features
        if len(price_data.columns) > 1:
            # Market correlation
            rolling_corr = returns.rolling(window=30).corr()
            
            # Average correlation for each asset
            for column in price_data.columns:
                corr_values = []
                for other_column in price_data.columns:
                    if column != other_column:
                        try:
                            corr_series = rolling_corr.loc[
                                rolling_corr.index.get_level_values(1) == column, other_column
                            ]
                            corr_values.append(corr_series)
                        except:
                            continue
                
                if corr_values:
                    avg_corr = pd.concat(corr_values, axis=1).mean(axis=1)
                    features[f'{column}_avg_correlation'] = avg_corr
        
        # Add macroeconomic indicators (simulated)
        features['market_volatility'] = returns.std(axis=1).rolling(window=20).mean()
        features['market_momentum'] = returns.mean(axis=1).rolling(window=10).mean()
        
        self.processed_data = features.dropna()
        return self.processed_data
    
    def clean_data(self, data: pd.DataFrame = None) -> pd.DataFrame:
        """Clean and preprocess data"""
        if data is None:
            data = self.data
        
        if data is None:
            raise ValueError("No data available")
        
        # Remove outliers (beyond 5 standard deviations)
        cleaned_data = data.copy()
        
        for column in cleaned_data.columns:
            if cleaned_data[column].dtype in ['float64', 'int64']:
                mean = cleaned_data[column].mean()
                std = cleaned_data[column].std()
                outlier_condition = np.abs(cleaned_data[column] - mean) > 5 * std
                cleaned_data.loc[outlier_condition, column] = np.nan
        
        # Forward fill missing values
        cleaned_data = cleaned_data.fillna(method='ffill')
        
        # Backward fill any remaining missing values
        cleaned_data = cleaned_data.fillna(method='bfill')
        
        return cleaned_data
    
    def export_to_csv(self, filepath: str, data: pd.DataFrame = None):
        """Export data to CSV file"""
        if data is None:
            data = self.data
        
        if data is None:
            raise ValueError("No data available")
        
        data.to_csv(filepath)
        print(f"Data exported to {filepath}")

# Example usage
if __name__ == "__main__":
    processor = DataProcessor()
    
    # Load data for Indian stocks
    symbols = ['TCS', 'RIL', 'INFY', 'HDFCBANK', 'GOLD', 'CASH']
    price_data = processor.load_stock_data(symbols)
    
    print("Price data shape:", price_data.shape)
    print("Price data head:\n", price_data.head())
    
    # Calculate returns
    returns = processor.calculate_returns()
    print("\nReturns data shape:", returns.shape)
    
    # Get summary statistics
    summary = processor.get_summary_statistics()
    print("\nSummary statistics:", summary)
    
    # Prepare ML features
    features = processor.prepare_ml_features()
    print("\nML features shape:", features.shape)
