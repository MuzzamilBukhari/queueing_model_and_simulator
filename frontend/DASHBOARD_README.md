# Queueing Theory Simulator Dashboard

A modern, responsive web application for simulating and analyzing queueing models built with Next.js, React, and Tailwind CSS.

## 🎯 Features

### ✨ Dashboard Layout
- **Fixed Sidebar Navigation** (250px width)
- **Dynamic Main Content Area**
- **Sticky Header** with theme toggle
- **Fully Responsive Design**

### 🧭 Navigation
- **Queueing Models** - Main simulation interface
- **Simulator** - Placeholder for future development

### 📊 Queueing Models Page

#### Model Selection
Support for multiple queueing models:
- M/M/1 - Single server, Markovian arrivals and service
- M/G/1 - Single server, Markovian arrivals, General service
- G/G/1 - General arrivals and service
- M/M/s - Multiple servers (with configurable server count)

#### Input Parameters
- **Arrival rate (λ)** - Average arrivals per time unit
- **Service rate (μ)** - Average services per time unit
- **Number of servers (s)** - Only for M/M/s model

#### Results Display
After running simulation, displays 5 key metrics:
1. **Mean Wait in Queue (Wq)** - Average waiting time
2. **Mean Number in Queue (Lq)** - Average queue length
3. **Mean Wait in System (Ws)** - Total time in system
4. **Mean Number in System (Ls)** - Total customers in system
5. **Server Idle Time** - Proportion of idle time

### 🎨 UI/UX Features
- **Light & Dark Mode** with toggle button
- **Loading States** with spinner animation
- **Toast Notifications** for user feedback
- **Form Validation** with helpful error messages
- **Smooth Transitions** and hover effects
- **Modern Card-Based Layout**
- **Color-Coded Metrics** for easy visualization

## 🛠️ Technology Stack

- **Framework:** Next.js 16.1.6
- **React:** 19.2.3
- **Styling:** Tailwind CSS 4.0
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Language:** TypeScript

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles and animations
└── components/
    ├── Sidebar.tsx         # Navigation sidebar
    ├── ModelSelector.tsx   # Model selection dropdown
    ├── InputForm.tsx       # Parameter input form
    ├── ResultsPanel.tsx    # Results display grid
    └── ThemeToggle.tsx     # Dark mode toggle button
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 💡 Usage

1. **Select a Queueing Model** from the dropdown
2. **Enter Parameters:**
   - Arrival rate (λ)
   - Service rate (μ)
   - Number of servers (for M/M/s only)
3. **Click "Run Simulation"** button
4. **View Results** displayed in metric cards

### Validation Rules
- All rates must be positive numbers
- For stable queues (except M/M/s): λ < μ
- Number of servers must be ≥ 1 (for M/M/s)

## 🎯 Component Architecture

### Sidebar Component
- **Props:** `activeTab`, `onTabChange`
- **Features:** Active state highlighting, icon support

### ModelSelector Component
- **Props:** `selectedModel`, `onModelChange`, `numberOfServers`, `onServersChange`
- **Features:** Conditional server input for M/M/s

### InputForm Component
- **Props:** Form values, handlers, loading state
- **Features:** Validation, loading spinner, disabled states

### ResultsPanel Component
- **Props:** `results` object
- **Features:** Color-coded cards, responsive grid, animations

### ThemeToggle Component
- **Features:** Persists theme to localStorage, system preference detection

## 🔧 Customization

### Adding New Models
1. Add model to `models` array in `ModelSelector.tsx`
2. Update validation logic in `page.tsx`
3. Implement calculation logic (replace mock data)

### Styling
- Modify `globals.css` for global styles
- Update Tailwind classes in components
- Customize color scheme in component files

## 📝 Notes

- **Current Implementation:** Mock results (random values)
- **Backend:** Not implemented - ready for integration
- **Future Enhancements:**
  - Real queueing theory calculations
  - Visualization charts
  - Export results functionality
  - Historical simulation data

## 🐛 Known Issues

- Results are currently mock data
- No persistence of simulation history
- Simulator tab is placeholder only

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

To add actual queueing theory calculations:

1. Create a `lib/queueing.ts` file
2. Implement calculation functions for each model
3. Replace mock results in `page.tsx` with actual calculations

Example structure:
```typescript
export function calculateMM1(lambda: number, mu: number) {
  const rho = lambda / mu;
  return {
    Wq: rho / (mu - lambda),
    Lq: (lambda * lambda) / (mu * (mu - lambda)),
    Ws: 1 / (mu - lambda),
    Ls: lambda / (mu - lambda),
    idleProportion: 1 - rho,
  };
}
```
