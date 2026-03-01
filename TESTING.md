# Testing the Queue Simulator

## Start the Backend API

```bash
cd backend/QueueSimulatorAPI
dotnet run
```

The API should start at: `http://localhost:5196`

## Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend should start at: `http://localhost:3000`

## Test the Application

1. Open `http://localhost:3000` in your browser
2. Select "M/M/1" model
3. Enter test values:
   - **Mean Interarrival Time**: `2.0` (average time between arrivals)
   - **Mean Service Time**: `1.5` (average service time)
4. Click "Run Simulation"

### Expected Results:
- **λ (Lambda)**: 0.5 (arrival rate = 1/2.0)
- **μ (Mu)**: 0.6667 (service rate = 1/1.5)
- **ρ (Rho)**: 75% (utilization = λ/μ)
- **Lq**: 2.25 (average queue length)
- **Wq**: 4.5 (average wait time in queue)
- **L**: 3.0 (average number in system)
- **W**: 6.0 (average time in system)
- **Idle Probability**: 25%

### Test Unstable System:
- **Mean Interarrival Time**: `1.0`
- **Mean Service Time**: `2.0`
- Result: Should get error "System unstable. Utilization (ρ) must be less than 1."

## What Changed:

### Frontend Updates:
✅ Input fields changed from "arrival rate" and "service rate" to "mean interarrival time" and "mean service time"
✅ API integration with `http://localhost:5196/api/simulation/mm1`
✅ Real-time calculation using backend API
✅ Updated results panel to show all M/M/1 metrics (λ, μ, ρ, Lq, Wq, L, W, Idle Probability)
✅ Proper error handling for unstable systems

### Files Modified:
- `frontend/src/components/InputForm.tsx` - Changed input fields
- `frontend/src/app/page.tsx` - Added API call logic
- `frontend/src/components/ResultsPanel.tsx` - Updated to display API response data
