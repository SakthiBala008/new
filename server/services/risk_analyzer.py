import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

class RiskAnalyzer:
    def __init__(self):
        self.returns_data = None
        self.portfolio_weights = None
        self.confidence_levels = [0.95, 0.99]
        
    def load_data(self, returns_data: pd.DataFrame, 
                  portfolio_weights: Optional[Dict[str, float]] = None):
        """Load returns data and portfolio weights"""
        self.returns_data = returns_data
        
        if portfolio_weights:
            # Normalize weights to sum to 1
            total_weight = sum(portfolio_weights.values())
            self.portfolio_weights = {k: v/total_weight for k, v in portfolio_weights.items()}
        else:
            # Equal weights
            n_assets = len(returns_data.columns)
            self.portfolio_weights = {col: 1/n_assets for col in returns_data.columns}
    
    def calculate_portfolio_returns(self) -> pd.Series:
        """Calculate portfolio returns based on weights"""
        if self.returns_data is None or self.portfolio_weights is None:
            raise ValueError("Returns data and weights must be loaded first")
        
        # Align weights with returns data columns
        weights_array = np.array([self.portfolio_weights.get(col, 0) 
                                 for col in self.returns_data.columns])
        
        # Calculate weighted portfolio returns
        portfolio_returns = (self.returns_data * weights_array).sum(axis=1)
        return portfolio_returns
    
    def value_at_risk(self, confidence_level: float = 0.95, 
                     method: str = 'historical') -> float:
        """
        Calculate Value at Risk (VaR)
        
        Methods:
        - historical: Historical simulation
        - parametric: Parametric (normal distribution)
        - monte_carlo: Monte Carlo simulation
        """
        portfolio_returns = self.calculate_portfolio_returns()
        
        if method == 'historical':
            # Historical VaR
            var = portfolio_returns.quantile(1 - confidence_level)
            
        elif method == 'parametric':
            # Parametric VaR (assuming normal distribution)
            mean_return = portfolio_returns.mean()
            std_return = portfolio_returns.std()
            z_score = stats.norm.ppf(1 - confidence_level)
            var = mean_return + z_score * std_return
            
        elif method == 'monte_carlo':
            # Monte Carlo VaR
            mean_return = portfolio_returns.mean()
            std_return = portfolio_returns.std()
            
            # Generate random scenarios
            np.random.seed(42)
            simulated_returns = np.random.normal(mean_return, std_return, 10000)
            var = np.percentile(simulated_returns, (1 - confidence_level) * 100)
            
        else:
            raise ValueError(f"Unknown VaR method: {method}")
        
        return var
    
    def conditional_value_at_risk(self, confidence_level: float = 0.95) -> float:
        """Calculate Conditional Value at Risk (Expected Shortfall)"""
        portfolio_returns = self.calculate_portfolio_returns()
        var = self.value_at_risk(confidence_level, method='historical')
        
        # Calculate mean of returns below VaR
        tail_returns = portfolio_returns[portfolio_returns <= var]
        cvar = tail_returns.mean() if len(tail_returns) > 0 else var
        
        return cvar
    
    def calculate_beta(self, market_returns: pd.Series = None, 
                      risk_free_rate: float = 0.06) -> float:
        """Calculate portfolio beta relative to market"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        if market_returns is None:
            # Use equally weighted market portfolio as proxy
            market_returns = self.returns_data.mean(axis=1)
        
        # Align data
        aligned_data = pd.concat([portfolio_returns, market_returns], axis=1).dropna()
        if aligned_data.shape[1] < 2:
            return 1.0  # Default beta if insufficient data
        
        portfolio_excess = aligned_data.iloc[:, 0] - risk_free_rate/252
        market_excess = aligned_data.iloc[:, 1] - risk_free_rate/252
        
        # Calculate beta using covariance
        covariance = np.cov(portfolio_excess, market_excess)[0, 1]
        market_variance = np.var(market_excess)
        
        beta = covariance / market_variance if market_variance != 0 else 1.0
        return beta
    
    def calculate_alpha(self, market_returns: pd.Series = None,
                       risk_free_rate: float = 0.06) -> float:
        """Calculate Jensen's Alpha"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        if market_returns is None:
            market_returns = self.returns_data.mean(axis=1)
        
        beta = self.calculate_beta(market_returns, risk_free_rate)
        
        # Annualized returns
        portfolio_return = portfolio_returns.mean() * 252
        market_return = market_returns.mean() * 252
        
        # Alpha = Portfolio Return - (Risk Free Rate + Beta * (Market Return - Risk Free Rate))
        alpha = portfolio_return - (risk_free_rate + beta * (market_return - risk_free_rate))
        return alpha
    
    def calculate_sharpe_ratio(self, risk_free_rate: float = 0.06) -> float:
        """Calculate Sharpe ratio"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        # Annualized metrics
        annual_return = portfolio_returns.mean() * 252
        annual_volatility = portfolio_returns.std() * np.sqrt(252)
        
        sharpe_ratio = (annual_return - risk_free_rate) / annual_volatility
        return sharpe_ratio
    
    def calculate_sortino_ratio(self, risk_free_rate: float = 0.06) -> float:
        """Calculate Sortino ratio (downside deviation)"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        # Annualized return
        annual_return = portfolio_returns.mean() * 252
        
        # Downside deviation (only negative returns)
        downside_returns = portfolio_returns[portfolio_returns < 0]
        downside_deviation = downside_returns.std() * np.sqrt(252)
        
        if downside_deviation == 0:
            return np.inf
        
        sortino_ratio = (annual_return - risk_free_rate) / downside_deviation
        return sortino_ratio
    
    def calculate_information_ratio(self, benchmark_returns: pd.Series = None) -> float:
        """Calculate Information ratio"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        if benchmark_returns is None:
            # Use equally weighted portfolio as benchmark
            benchmark_returns = self.returns_data.mean(axis=1)
        
        # Active returns
        active_returns = portfolio_returns - benchmark_returns
        
        # Information ratio
        if active_returns.std() == 0:
            return 0
        
        info_ratio = active_returns.mean() * np.sqrt(252) / (active_returns.std() * np.sqrt(252))
        return info_ratio
    
    def maximum_drawdown(self) -> Dict[str, float]:
        """Calculate maximum drawdown and related metrics"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        # Calculate cumulative returns
        cumulative_returns = (1 + portfolio_returns).cumprod()
        
        # Calculate running maximum
        running_max = cumulative_returns.expanding().max()
        
        # Calculate drawdown
        drawdown = (cumulative_returns - running_max) / running_max
        
        # Maximum drawdown
        max_dd = drawdown.min()
        
        # Find drawdown periods
        max_dd_idx = drawdown.idxmin()
        
        # Recovery time (simplified)
        recovery_data = drawdown[max_dd_idx:]
        recovery_idx = recovery_data[recovery_data >= -0.01].index  # Within 1% of peak
        
        if len(recovery_idx) > 0:
            recovery_time = (recovery_idx[0] - max_dd_idx).days
        else:
            recovery_time = None
        
        return {
            'max_drawdown': max_dd,
            'max_drawdown_date': max_dd_idx,
            'recovery_time_days': recovery_time,
            'current_drawdown': drawdown.iloc[-1]
        }
    
    def calculate_volatility_metrics(self) -> Dict[str, float]:
        """Calculate various volatility metrics"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        # Standard volatility
        volatility = portfolio_returns.std() * np.sqrt(252)
        
        # Downside volatility
        downside_returns = portfolio_returns[portfolio_returns < portfolio_returns.mean()]
        downside_volatility = downside_returns.std() * np.sqrt(252)
        
        # Upside volatility
        upside_returns = portfolio_returns[portfolio_returns > portfolio_returns.mean()]
        upside_volatility = upside_returns.std() * np.sqrt(252)
        
        # Rolling volatility (30-day)
        rolling_vol = portfolio_returns.rolling(window=30).std() * np.sqrt(252)
        
        return {
            'volatility': volatility,
            'downside_volatility': downside_volatility,
            'upside_volatility': upside_volatility,
            'current_30d_volatility': rolling_vol.iloc[-1] if not rolling_vol.empty else volatility,
            'avg_30d_volatility': rolling_vol.mean(),
            'volatility_of_volatility': rolling_vol.std()
        }
    
    def calculate_tracking_error(self, benchmark_returns: pd.Series = None) -> float:
        """Calculate tracking error relative to benchmark"""
        portfolio_returns = self.calculate_portfolio_returns()
        
        if benchmark_returns is None:
            benchmark_returns = self.returns_data.mean(axis=1)
        
        # Active returns
        active_returns = portfolio_returns - benchmark_returns
        
        # Tracking error (annualized standard deviation of active returns)
        tracking_error = active_returns.std() * np.sqrt(252)
        return tracking_error
    
    def stress_test(self, scenarios: Dict[str, Dict[str, float]]) -> Dict[str, float]:
        """
        Perform stress testing on the portfolio
        
        scenarios: Dict with scenario names and asset return shocks
        Example: {'crash': {'TCS': -0.3, 'RIL': -0.25, 'GOLD': 0.1}}
        """
        stress_results = {}
        
        for scenario_name, shocks in scenarios.items():
            portfolio_shock = 0
            
            for asset, weight in self.portfolio_weights.items():
                shock = shocks.get(asset, 0)
                portfolio_shock += weight * shock
            
            stress_results[scenario_name] = portfolio_shock
        
        return stress_results
    
    def generate_risk_report(self, portfolio_value: float = 1000000,
                           confidence_levels: List[float] = None) -> Dict:
        """Generate comprehensive risk report"""
        if confidence_levels is None:
            confidence_levels = [0.95, 0.99]
        
        # Calculate all risk metrics
        portfolio_returns = self.calculate_portfolio_returns()
        
        # VaR metrics
        var_metrics = {}
        for cl in confidence_levels:
            var_metrics[f'var_{int(cl*100)}'] = self.value_at_risk(cl) * portfolio_value
            var_metrics[f'cvar_{int(cl*100)}'] = self.conditional_value_at_risk(cl) * portfolio_value
        
        # Other metrics
        beta = self.calculate_beta()
        alpha = self.calculate_alpha()
        sharpe = self.calculate_sharpe_ratio()
        sortino = self.calculate_sortino_ratio()
        info_ratio = self.calculate_information_ratio()
        
        # Drawdown metrics
        dd_metrics = self.maximum_drawdown()
        
        # Volatility metrics
        vol_metrics = self.calculate_volatility_metrics()
        
        # Stress test scenarios
        stress_scenarios = {
            'market_crash': {'TCS': -0.3, 'RIL': -0.25, 'INFY': -0.28, 'HDFCBANK': -0.35, 'GOLD': 0.05, 'CASH': 0},
            'tech_selloff': {'TCS': -0.4, 'RIL': -0.1, 'INFY': -0.35, 'HDFCBANK': -0.15, 'GOLD': 0.1, 'CASH': 0},
            'currency_crisis': {'TCS': -0.2, 'RIL': -0.3, 'INFY': -0.2, 'HDFCBANK': -0.4, 'GOLD': 0.15, 'CASH': -0.05}
        }
        stress_results = self.stress_test(stress_scenarios)
        
        # Compile report
        risk_report = {
            'portfolio_value': portfolio_value,
            'daily_volatility': vol_metrics['volatility'] / np.sqrt(252),
            'annual_volatility': vol_metrics['volatility'],
            'var_95': var_metrics.get('var_95', 0),
            'var_99': var_metrics.get('var_99', 0),
            'cvar_95': var_metrics.get('cvar_95', 0),
            'beta': beta,
            'alpha': alpha,
            'sharpe_ratio': sharpe,
            'sortino_ratio': sortino,
            'information_ratio': info_ratio,
            'max_drawdown': dd_metrics['max_drawdown'],
            'max_drawdown_value': dd_metrics['max_drawdown'] * portfolio_value,
            'current_drawdown': dd_metrics['current_drawdown'],
            'tracking_error': self.calculate_tracking_error(),
            'stress_test_results': {k: v * portfolio_value for k, v in stress_results.items()},
            'volatility_metrics': vol_metrics,
            'drawdown_metrics': dd_metrics
        }
        
        return risk_report
    
    def monte_carlo_simulation(self, time_horizon_days: int = 252, 
                              num_simulations: int = 10000,
                              initial_value: float = 1000000) -> Dict:
        """
        Perform Monte Carlo simulation for portfolio projections
        """
        portfolio_returns = self.calculate_portfolio_returns()
        
        # Calculate parameters
        mean_return = portfolio_returns.mean()
        std_return = portfolio_returns.std()
        
        # Run simulations
        np.random.seed(42)
        simulations = np.zeros((num_simulations, time_horizon_days))
        
        for i in range(num_simulations):
            # Generate random returns
            random_returns = np.random.normal(mean_return, std_return, time_horizon_days)
            
            # Calculate cumulative portfolio values
            portfolio_values = [initial_value]
            for daily_return in random_returns:
                portfolio_values.append(portfolio_values[-1] * (1 + daily_return))
            
            simulations[i] = portfolio_values[1:]  # Exclude initial value
        
        # Calculate statistics
        final_values = simulations[:, -1]
        
        monte_carlo_results = {
            'initial_value': initial_value,
            'time_horizon_days': time_horizon_days,
            'num_simulations': num_simulations,
            'mean_final_value': np.mean(final_values),
            'median_final_value': np.median(final_values),
            'std_final_value': np.std(final_values),
            'percentile_5': np.percentile(final_values, 5),
            'percentile_25': np.percentile(final_values, 25),
            'percentile_75': np.percentile(final_values, 75),
            'percentile_95': np.percentile(final_values, 95),
            'probability_of_loss': np.sum(final_values < initial_value) / num_simulations,
            'expected_return': (np.mean(final_values) - initial_value) / initial_value,
            'simulation_paths': simulations.tolist()  # For plotting
        }
        
        return monte_carlo_results

# Example usage
if __name__ == "__main__":
    # Create sample data
    np.random.seed(42)
    dates = pd.date_range(start='2020-01-01', end='2024-12-31', freq='D')
    
    # Generate sample returns
    returns_data = pd.DataFrame({
        'TCS': np.random.normal(0.0004, 0.02, len(dates)),
        'RIL': np.random.normal(0.0003, 0.025, len(dates)),
        'INFY': np.random.normal(0.0005, 0.022, len(dates)),
        'HDFCBANK': np.random.normal(0.0002, 0.03, len(dates)),
        'GOLD': np.random.normal(0.0002, 0.015, len(dates)),
        'CASH': np.random.normal(0.0002, 0.001, len(dates))
    }, index=dates)
    
    # Portfolio weights
    weights = {'TCS': 0.25, 'RIL': 0.20, 'INFY': 0.15, 'HDFCBANK': 0.20, 'GOLD': 0.15, 'CASH': 0.05}
    
    # Initialize risk analyzer
    risk_analyzer = RiskAnalyzer()
    risk_analyzer.load_data(returns_data, weights)
    
    # Generate risk report
    risk_report = risk_analyzer.generate_risk_report(portfolio_value=1000000)
    
    print("Risk Report:")
    for key, value in risk_report.items():
        if isinstance(value, dict):
            print(f"{key}: {value}")
        else:
            print(f"{key}: {value:.4f}")
    
    # Monte Carlo simulation
    mc_results = risk_analyzer.monte_carlo_simulation()
    print(f"\nMonte Carlo Results:")
    print(f"Expected value in 1 year: ₹{mc_results['mean_final_value']:,.2f}")
    print(f"Probability of loss: {mc_results['probability_of_loss']:.2%}")
