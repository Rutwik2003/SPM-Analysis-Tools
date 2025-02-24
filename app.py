from flask import Flask, render_template, request
import numpy_financial as npf

app = Flask(__name__)

# Calculation functions
def calculate_roi(net_profit, investment, duration):
    average_annual_profit = net_profit / duration
    return (average_annual_profit / investment) * 100

def calculate_npv_detailed(initial_investment, annual_cashflow, discount_rate, duration):
    rate = discount_rate / 100
    npv = -initial_investment
    yearly_data = []
    for t in range(1, duration + 1):
        discount_factor = 1 / (1 + rate) ** t
        discounted_cashflow = discount_factor * annual_cashflow
        npv += discounted_cashflow
        yearly_data.append((t, round(discount_factor, 4), int(round(discounted_cashflow))))
    return npv, yearly_data

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            # Get solar data
            solar_investment = float(request.form['solar_investment'])
            solar_annual_cashflow = float(request.form['solar_annual_cashflow'])
            solar_net_profit = float(request.form['solar_net_profit'])
            solar_duration = int(request.form['solar_duration'])
            solar_discount_low = float(request.form['solar_discount_low'])
            solar_discount_high = float(request.form['solar_discount_high'])

            # Get wind data
            wind_investment = float(request.form['wind_investment'])
            wind_annual_cashflow = float(request.form['wind_annual_cashflow'])
            wind_net_profit = float(request.form['wind_net_profit'])
            wind_duration = int(request.form['wind_duration'])
            wind_discount_low = float(request.form['wind_discount_low'])
            wind_discount_high = float(request.form['wind_discount_high'])

            # Solar calculations
            solar_roi = calculate_roi(solar_net_profit, solar_investment, solar_duration)
            solar_npv_low, solar_yearly_low = calculate_npv_detailed(solar_investment, solar_annual_cashflow, solar_discount_low, solar_duration)
            solar_npv_high, solar_yearly_high = calculate_npv_detailed(solar_investment, solar_annual_cashflow, solar_discount_high, solar_duration)
            solar_irr = (solar_npv_low / (solar_npv_low - solar_npv_high)) * (solar_discount_high - solar_discount_low)

            # Wind calculations
            wind_roi = calculate_roi(wind_net_profit, wind_investment, wind_duration)
            wind_npv_low, wind_yearly_low = calculate_npv_detailed(wind_investment, wind_annual_cashflow, wind_discount_low, wind_duration)
            wind_npv_high, wind_yearly_high = calculate_npv_detailed(wind_investment, wind_annual_cashflow, wind_discount_high, wind_duration)
            wind_irr = (wind_npv_low / (wind_npv_low - wind_npv_high)) * (wind_discount_high - wind_discount_low)

            # Detailed recommendation
            if solar_npv_low > wind_npv_low:
                recommendation = (
                    f"Recommendation: Select the Solar Project. "
                    f"It has a higher NPV of ${solar_npv_low:,.2f} at {solar_discount_low}% "
                    f"compared to the Wind Project's NPV of ${wind_npv_low:,.2f} at {wind_discount_low}%, "
                    f"indicating better long-term value."
                )
            else:
                recommendation = (
                    f"Recommendation: Select the Wind Project. "
                    f"It has a higher NPV of ${wind_npv_low:,.2f} at {wind_discount_low}% "
                    f"compared to the Solar Project's NPV of ${solar_npv_low:,.2f} at {solar_discount_low}%, "
                    f"indicating better long-term value."
                )

            # Render results
            return render_template('results.html', 
                                   solar_roi=round(solar_roi, 2), 
                                   solar_npv_low=round(solar_npv_low, 2), 
                                   solar_npv_high=round(solar_npv_high, 2), 
                                   solar_irr=round(solar_irr, 2), 
                                   solar_yearly_low=solar_yearly_low, 
                                   solar_yearly_high=solar_yearly_high,
                                   wind_roi=round(wind_roi, 2), 
                                   wind_npv_low=round(wind_npv_low, 2), 
                                   wind_npv_high=round(wind_npv_high, 2), 
                                   wind_irr=round(wind_irr, 2), 
                                   wind_yearly_low=wind_yearly_low, 
                                   wind_yearly_high=wind_yearly_high,
                                   recommendation=recommendation)
        except ValueError as e:
            return render_template('index.html', error="Invalid input: Please enter numeric values.")
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)