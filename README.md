# System Mapping Toolkit

A comprehensive web-based application for conducting systems thinking exercises through a structured five-phase process. This toolkit guides users through analyzing complex systems, identifying relationships between variables, discovering feedback loops, and finding leverage points for positive change.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)

## 🌟 Features

### Complete 5-Phase Methodology

1. **Frame Phase** - Define context, problems, and research questions
2. **Explore Phase** - Identify and organize system variables with clustering
3. **Map Phase** - Create visual system maps with React Flow
4. **Reflect Phase** - Synthesize insights and create narratives
5. **Leverage Phase** - Identify intervention points for positive change

### Core Capabilities

- ✅ **Interactive Visual Mapping** - Drag-and-drop canvas with zoom, pan, and minimap
- ✅ **Causal Connections** - Create positive and negative relationships between variables
- ✅ **Feedback Loop Analysis** - Identify reinforcing and balancing loops
- ✅ **Region Definition** - Group variables into thematic areas
- ✅ **Auto-Save** - Automatic persistence with 1-second debounce
- ✅ **Project Management** - Create, open, delete, and export projects
- ✅ **Data Export** - JSON export for backup and sharing
- ✅ **Phase Progression** - Sequential unlocking based on completion criteria
- ✅ **Responsive Design** - Works on desktop and tablet devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## 📖 Usage Guide

### Creating a New Project

1. Click "New Project" on the home dashboard
2. Enter a project title
3. Begin with Phase 1: Frame

### Phase 1: Frame the System

- **Context**: Describe the system you want to map
- **Problem Statement**: Articulate the problems you observe
- **Research Questions**: Formulate key questions (starting with "Why..." or "What factors...")
- **System Goals**: Define what you want to achieve with your map

### Phase 2: Explore the System

- **Main Variable**: Define the central variable representing your key issue
- **Variable Collection**: Brainstorm all variables that influence your main variable
- **Clustering**: Organize variables into thematic groups (environmental, social, technological, etc.)
- **Research Notes**: Document your sources and methodology

### Phase 3: Map the System

- **Visual Canvas**: Interactive canvas powered by React Flow
- **Variable Placement**: Add variables to the map and position them
- **Connections**: Draw causal links with positive (+) or negative (-) polarity
- **Feedback Loops**: Identify and mark closed causal chains
  - Reinforcing (R): Amplify change
  - Balancing (B): Resist change
- **Regions**: Define thematic boundaries around variable groups

### Phase 4: Reflect on the System

- **Key Insights**: Document what you learned from mapping
- **Region Stories**: Describe dynamics within each defined region
- **Core Systems Story**: Synthesize a narrative explaining system behavior
- **Stakeholder Feedback**: Collect input from experts and stakeholders

### Phase 5: Leverage for Change

- **System Vision**: Articulate your desired future state
- **Map Analysis**: Mark areas showing:
  - 🌊 Ripple Effects
  - 🧊 Frozen Areas
  - 💡 Potential for Change
  - ✨ Positive Change Happening
- **Leverage Points**: Define specific intervention opportunities
  - Short-term influence
  - Long-term impact
  - Brainstorming questions

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: React 18.3
- **Language**: TypeScript 5.6
- **Build Tool**: Vite 7.2
- **Routing**: React Router DOM 7.1
- **Visual Mapping**: React Flow 11.11
- **State Management**: React Context API
- **Storage**: Browser localStorage
- **Styling**: Custom CSS with CSS variables

### Project Structure

```
src/
├── types/              # TypeScript interfaces and data models
│   └── index.ts
├── utils/              # Utility functions
│   ├── projectUtils.ts # Project creation and validation
│   └── storage.ts      # Local storage operations
├── context/            # State management
│   └── ProjectContext.tsx
├── components/         # Reusable UI components
│   ├── Layout.tsx
│   └── PhaseNavigation.tsx
├── pages/              # Page components for each phase
│   ├── Home.tsx
│   ├── FramePhase.tsx
│   ├── ExplorePhase.tsx
│   ├── MapPhase.tsx
│   ├── ReflectPhase.tsx
│   └── LeveragePhase.tsx
└── App.tsx             # Root component with routing
```

### Data Model

Projects are stored as JSON with the following structure:

```typescript
interface Project {
  id: string;
  title: string;
  createdAt: string;
  modifiedAt: string;
  currentPhase: PhaseType;
  framePhase: FramePhase;
  explorePhase: ExplorePhase;
  mapPhase: MapPhase;
  reflectPhase: ReflectPhase;
  leveragePhase: LeveragePhase;
}
```

Each phase contains specific data structures for:
- Frame: Context, problems, questions, goals
- Explore: Main variable, variables, clusters
- Map: Variables (positioned), connections, feedback loops, regions
- Reflect: Insights, region stories, core story, feedback
- Leverage: Vision, analysis markers, leverage points

## 💾 Data Persistence

### Local Storage

- All data is stored in browser localStorage
- Auto-save every 1 second after changes
- Manual save button available
- No server required - fully client-side

### Export/Import

- Export projects as JSON files
- Download for backup or sharing
- Import previously exported projects
- Cross-browser compatible

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#2563eb)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Neutrals**: Gray scale

### Typography

- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Headings**: 600 weight, line-height 1.2
- **Body**: 400 weight, line-height 1.5

### Spacing

Uses a consistent spacing scale based on rem units:
- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem

## 🧪 Testing

```bash
# Type checking
npm run build

# Linting
npm run lint
```

## 📝 Development Workflow

1. **Make changes** to source files in `src/`
2. **Hot reload** updates automatically in dev mode
3. **TypeScript** validates types during development
4. **Build** creates optimized production bundle
5. **Deploy** static files to any hosting service

## 🚢 Deployment

The application builds to static files and can be deployed to:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag `dist/` folder to Netlify
- **GitHub Pages**: Push `dist/` to gh-pages branch
- **AWS S3**: Upload `dist/` contents
- **Any static host**: Serve files from `dist/`

## 🤝 Contributing

This is a specialized systems thinking tool. Contributions should maintain:
- Methodological rigor
- User experience simplicity
- Type safety
- Performance
- Accessibility

## 📄 License

This project is provided as-is for systems thinking education and practice.

## 🙏 Acknowledgments

Based on systems thinking principles and methodologies from:
- Peter Senge's "The Fifth Discipline"
- Donella Meadows' "Thinking in Systems"
- System dynamics and causal loop diagramming practices

## 📧 Support

For issues, questions, or feedback, please open an issue in the repository.

---

Built with ❤️ for systems thinkers everywhere
