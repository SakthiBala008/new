import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy import linalg
import cvxpy as cp
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class PortfolioOptimizer:
    def __init__(self):
        self.returns_data = None
        self.expected_returns = None
        self.cov_matrix = None
        self.risk_free_rate = 0.06  # 6% risk-free rate for India
    
    def load_data(self, returns_data: pd.DataFrame):
        """Load historical returns data"""
        self.returns_data = returns_data
        self.expected_returns = returns_data.mean() * 252  # Annualized
        self.cov_matrix = returns_data.cov() * 252  # Annualized
    
    def modern_portfolio_theory(self, target_return: Optional[float] = None, 
                               risk_tolerance: str = 'moderate') -> Dict:
        """
        Implement Modern Portfolio Theory optimization
        """
        if self.expected_returns is None or self.cov_matrix is None:
            raise ValueError("Returns data not loaded. Call load_data() first.")
        
        n_assets = len(self.expected_returns)
        
        # Define optimization variables
        weights = cp.Variable(n_assets)
        
        # Expected portfolio return
        portfolio_return = self.expected_returns.values @ weights
        
        # Portfolio variance
        portfolio_variance = cp.quad_form(weights, self.cov_matrix.values)
        
        # Constraints
        constraints = [
            cp.sum(weights) == 1,  # Weights sum to 1
            weights >= 0,  # Long-only positions
            weights <= 0.4  # Maximum 40% in any single asset
        ]
        
        # Risk tolerance based constraints
        if risk_tolerance == 'conservative':
            max_risk = 0.15  # Maximum 15% volatility
            constraints.append(cp.sqrt(portfolio_variance) <= max_risk)
        elif risk_tolerance == 'aggressive':
            min_return = 0.18  # Minimum 18% return
            constraints.append(portfolio_return >= min_return)
        
        # Objective function - maximize Sharpe ratio
        if target_return is None:
            # Maximize Sharpe ratio
            objective = cp.Maximize(
                (portfolio_return - self.risk_free_rate) / cp.sqrt(portfolio_variance)
            )
        else:
            # Minimize risk for target return
            constraints.append(portfolio_return >= target_return)
            objective = cp.Minimize(portfolio_variance)
        
        # Solve optimization problem
        problem = cp.Problem(objective, constraints)
        
        try:
            problem.solve(solver=cp.OSQP, verbose=False)
            
            if weights.value is None:
                # Fallback to equal weights if optimization fails
                optimal_weights = np.ones(n_assets) / n_assets
            else:
                optimal_weights = weights.value
            
            # Calculate portfolio metrics
            portfolio_return_val = float(np.dot(optimal_weights, self.expected_returns.values))
            portfolio_risk_val = float(np.sqrt(np.dot(optimal_weights, 
                                                    np.dot(self.cov_matrix.values, optimal_weights))))
            sharpe_ratio = (portfolio_return_val - self.risk_free_rate) / portfolio_risk_val
            
            # Convert to asset allocation percentages
            allocation = {}
            for i, asset in enumerate(self.expected_returns.index):
                if optimal_weights[i] > 0.01:  # Only include assets with >1% allocation
                    allocation[asset] = float(optimal_weights[i] * 100)
            
            return {
                'algorithm': 'MPT',
                'weights': optimal_weights.tolist(),
                'allocation': allocation,
                'expected_return': portfolio_return_val,
                'risk': portfolio_risk_val,
                'sharpe_ratio': sharpe_ratio,
                'status': 'success'
            }
            
        except Exception as e:
            # Return equal weight portfolio as fallback
            equal_weights = np.ones(n_assets) / n_assets
            portfolio_return_val = float(np.dot(equal_weights, self.expected_returns.values))
            portfolio_risk_val = float(np.sqrt(np.dot(equal_weights, 
                                                    np.dot(self.cov_matrix.values, equal_weights))))
            
            allocation = {}
            for i, asset in enumerate(self.expected_returns.index):
                allocation[asset] = float(equal_weights[i] * 100)
            
            return {
                'algorithm': 'MPT',
                'weights': equal_weights.tolist(),
                'allocation': allocation,
                'expected_return': portfolio_return_val,
                'risk': portfolio_risk_val,
                'sharpe_ratio': (portfolio_return_val - self.risk_free_rate) / portfolio_risk_val,
                'status': 'fallback',
                'error': str(e)
            }
    
    def black_litterman(self, market_caps: Dict[str, float], 
                       investor_views: Optional[Dict[str, float]] = None,
                       risk_tolerance: str = 'moderate') -> Dict:
        """
        Implement Black-Litterman Model
        """
        if self.expected_returns is None or self.cov_matrix is None:
            raise ValueError("Returns data not loaded. Call load_data() first.")
        
        try:
            # Market capitalization weights
            total_market_cap = sum(market_caps.values())
            market_weights = np.array([market_caps.get(asset, 0) / total_market_cap 
                                     for asset in self.expected_returns.index])
            
            # Risk aversion parameter (higher = more risk averse)
            risk_aversion = {'conservative': 5, 'moderate': 3, 'aggressive': 1.5}[risk_tolerance]
            
            # Implied equilibrium returns
            pi = risk_aversion * np.dot(self.cov_matrix.values, market_weights)
            
            # Black-Litterman parameters
            tau = 0.025  # Scaling factor for uncertainty in prior
            
            if investor_views:
                # Incorporate investor views
                # P matrix: picks out the assets in the views
                # Q vector: the views (expected returns)
                view_assets = list(investor_views.keys())
                n_views = len(view_assets)
                n_assets = len(self.expected_returns)
                
                P = np.zeros((n_views, n_assets))
                Q = np.zeros(n_views)
                
                for i, asset in enumerate(view_assets):
                    if asset in self.expected_returns.index:
                        asset_idx = self.expected_returns.index.get_loc(asset)
                        P[i, asset_idx] = 1
                        Q[i] = investor_views[asset]
                
                # Uncertainty matrix for views (diagonal)
                omega = np.diag(np.diag(np.dot(P, np.dot(tau * self.cov_matrix.values, P.T))))
                
                # Black-Litterman formula
                cov_prior = tau * self.cov_matrix.values
                cov_posterior_inv = np.linalg.inv(cov_prior) + np.dot(P.T, np.dot(np.linalg.inv(omega), P))
                cov_posterior = np.linalg.inv(cov_posterior_inv)
                
                mu_posterior = np.dot(cov_posterior, 
                                    np.dot(np.linalg.inv(cov_prior), pi) + 
                                    np.dot(P.T, np.dot(np.linalg.inv(omega), Q)))
            else:
                # No views, use equilibrium returns
                mu_posterior = pi
                cov_posterior = self.cov_matrix.values
            
            # Optimize portfolio using Black-Litterman inputs
            n_assets = len(mu_posterior)
            weights = cp.Variable(n_assets)
            
            portfolio_return = mu_posterior @ weights
            portfolio_variance = cp.quad_form(weights, cov_posterior)
            
            constraints = [
                cp.sum(weights) == 1,
                weights >= 0,
                weights <= 0.4
            ]
            
            # Maximize utility (return - risk penalty)
            utility = portfolio_return - (risk_aversion / 2) * portfolio_variance
            objective = cp.Maximize(utility)
            
            problem = cp.Problem(objective, constraints)
            problem.solve(solver=cp.OSQP, verbose=False)
            
            if weights.value is None:
                optimal_weights = market_weights
            else:
                optimal_weights = weights.value
            
            # Calculate portfolio metrics
            portfolio_return_val = float(np.dot(optimal_weights, mu_posterior))
            portfolio_risk_val = float(np.sqrt(np.dot(optimal_weights, 
                                                    np.dot(cov_posterior, optimal_weights))))
            sharpe_ratio = (portfolio_return_val - self.risk_free_rate) / portfolio_risk_val
            
            # Convert to allocation percentages
            allocation = {}
            for i, asset in enumerate(self.expected_returns.index):
                if optimal_weights[i] > 0.01:
                    allocation[asset] = float(optimal_weights[i] * 100)
            
            return {
                'algorithm': 'Black-Litterman',
                'weights': optimal_weights.tolist(),
                'allocation': allocation,
                'expected_return': portfolio_return_val,
                'risk': portfolio_risk_val,
                'sharpe_ratio': sharpe_ratio,
                'equilibrium_returns': pi.tolist(),
                'posterior_returns': mu_posterior.tolist(),
                'status': 'success'
            }
            
        except Exception as e:
            # Fallback to market cap weighted portfolio
            allocation = {}
            for asset, weight in zip(self.expected_returns.index, market_weights):
                if weight > 0.01:
                    allocation[asset] = float(weight * 100)
            
            portfolio_return_val = float(np.dot(market_weights, self.expected_returns.values))
            portfolio_risk_val = float(np.sqrt(np.dot(market_weights, 
                                                    np.dot(self.cov_matrix.values, market_weights))))
            
            return {
                'algorithm': 'Black-Litterman',
                'weights': market_weights.tolist(),
                'allocation': allocation,
                'expected_return': portfolio_return_val,
                'risk': portfolio_risk_val,
                'sharpe_ratio': (portfolio_return_val - self.risk_free_rate) / portfolio_risk_val,
                'status': 'fallback',
                'error': str(e)
            }
    
    def efficient_frontier(self, n_points: int = 50) -> Dict:
        """
        Calculate the efficient frontier
        """
        if self.expected_returns is None or self.cov_matrix is None:
            raise ValueError("Returns data not loaded. Call load_data() first.")
        
        min_return = self.expected_returns.min()
        max_return = self.expected_returns.max()
        target_returns = np.linspace(min_return, max_return, n_points)
        
        efficient_portfolios = []
        
        for target_return in target_returns:
            try:
                result = self.modern_portfolio_theory(target_return=target_return)
                if result['status'] == 'success':
                    efficient_portfolios.append({
                        'return': result['expected_return'],
                        'risk': result['risk'],
                        'sharpe_ratio': result['sharpe_ratio']
                    })
            except:
                continue
        
        return {
            'efficient_frontier': efficient_portfolios,
            'risk_free_rate': self.risk_free_rate
        }
    
    def optimize_portfolio(self, algorithm: str = 'MPT', 
                          risk_tolerance: str = 'moderate',
                          investment_amount: float = 1000000,
                          **kwargs) -> Dict:
        """
        Main optimization function
        """
        # Generate sample data if not provided
        if self.returns_data is None:
            self._generate_sample_data()
        
        if algorithm.upper() == 'MPT':
            result = self.modern_portfolio_theory(risk_tolerance=risk_tolerance)
        elif algorithm.upper() == 'BLACK-LITTERMAN':
            # Default market caps for Indian stocks
            market_caps = {
                'TCS': 0.25, 'RIL': 0.20, 'INFY': 0.15, 
                'HDFCBANK': 0.20, 'GOLD': 0.15, 'CASH': 0.05
            }
            result = self.black_litterman(market_caps, risk_tolerance=risk_tolerance)
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")
        
        # Add investment amount context
        result['investment_amount'] = investment_amount
        result['risk_tolerance'] = risk_tolerance
        
        return result
    
    def _generate_sample_data(self):
        """Generate sample returns data for demonstration"""
        np.random.seed(42)
        assets = ['TCS', 'RIL', 'INFY', 'HDFCBANK', 'GOLD', 'CASH']
        dates = pd.date_range(start='2020-01-01', end='2024-12-31', freq='D')
        
        # Generate correlated returns
        n_assets = len(assets)
        n_days = len(dates)
        
        # Create correlation matrix
        correlation = np.array([
            [1.0, 0.6, 0.8, 0.5, 0.1, 0.0],  # TCS
            [0.6, 1.0, 0.4, 0.6, 0.2, 0.0],  # RIL
            [0.8, 0.4, 1.0, 0.5, 0.1, 0.0],  # INFY
            [0.5, 0.6, 0.5, 1.0, 0.3, 0.0],  # HDFCBANK
            [0.1, 0.2, 0.1, 0.3, 1.0, 0.0],  # GOLD
            [0.0, 0.0, 0.0, 0.0, 0.0, 1.0]   # CASH
        ])
        
        # Generate returns with different volatilities
        volatilities = [0.25, 0.30, 0.28, 0.35, 0.20, 0.02]  # Annual volatilities
        daily_vols = [vol / np.sqrt(252) for vol in volatilities]
        
        # Generate random returns
        random_returns = np.random.multivariate_normal(
            mean=[0] * n_assets,
            cov=correlation,
            size=n_days
        )
        
        # Scale by volatilities
        returns_data = pd.DataFrame(
            random_returns * daily_vols,
            index=dates,
            columns=assets
        )
        
        # Add some trend to make returns more realistic
        drift = [0.12, 0.10, 0.14, 0.08, 0.06, 0.04]  # Annual drift
        daily_drift = [d / 252 for d in drift]
        
        for i, asset in enumerate(assets):
            returns_data[asset] += daily_drift[i]
        
        self.load_data(returns_data)

# Example usage
if __name__ == "__main__":
    optimizer = PortfolioOptimizer()
    
    # Test with sample data
    mpt_result = optimizer.optimize_portfolio('MPT', 'moderate', 1000000)
    print("MPT Result:", mpt_result)
    
    bl_result = optimizer.optimize_portfolio('Black-Litterman', 'moderate', 1000000)
    print("Black-Litterman Result:", bl_result)
