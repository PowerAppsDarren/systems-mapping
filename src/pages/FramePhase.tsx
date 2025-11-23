import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../context/ProjectContext';
import { Layout } from '../components/Layout';
import type { ResearchQuestion, SystemGoal } from '../types';
import { isPhaseComplete } from '../utils/projectUtils';
import './FramePhase.css';

export function FramePhase() {
  const navigate = useNavigate();
  const { currentProject, updateProject, completePhase } = useProject();

  if (!currentProject) {
    navigate('/');
    return null;
  }

  const { framePhase } = currentProject;

  const [context, setContext] = useState(framePhase.context);
  const [problemStatement, setProblemStatement] = useState(framePhase.problemStatement);
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>(
    framePhase.researchQuestions
  );
  const [goals, setGoals] = useState<SystemGoal[]>(framePhase.goals);
  const [newQuestion, setNewQuestion] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // Auto-save changes
  useEffect(() => {
    if (currentProject) {
      updateProject({
        framePhase: {
          ...framePhase,
          context,
          problemStatement,
          researchQuestions,
          goals,
        },
      });
    }
  }, [context, problemStatement, researchQuestions, goals]);

  const addResearchQuestion = () => {
    if (newQuestion.trim()) {
      const question: ResearchQuestion = {
        id: uuidv4(),
        text: newQuestion.trim(),
        createdAt: new Date().toISOString(),
      };
      setResearchQuestions([...researchQuestions, question]);
      setNewQuestion('');
    }
  };

  const removeResearchQuestion = (id: string) => {
    setResearchQuestions(researchQuestions.filter((q) => q.id !== id));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const goal: SystemGoal = {
        id: uuidv4(),
        text: newGoal.trim(),
        createdAt: new Date().toISOString(),
      };
      setGoals([...goals, goal]);
      setNewGoal('');
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleComplete = () => {
    if (isPhaseComplete(currentProject, 'frame')) {
      completePhase('frame');
      navigate('/project/explore');
    } else {
      alert('Please complete all required fields before proceeding to the next phase.');
    }
  };

  const canComplete = isPhaseComplete(currentProject, 'frame');

  return (
    <Layout showPhaseNavigation>
      <div className="phase-page frame-phase">
        <div className="phase-header">
          <h1>Frame the System</h1>
          <p className="phase-description">
            Establish the foundation for your mapping exercise by defining the context, problems, and
            research questions that will guide your analysis.
          </p>
        </div>

        <div className="phase-content">
          {/* Context and Problem Statement */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Context and Problem Statement</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Start by describing the system you want to map and articulating the problems you
                observe. This context will guide your entire mapping process.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="context">
                What system or general topic do you want to map?
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Describe the system context, boundaries, and key stakeholders..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="problem">
                What is/are the problem(s) that you see in the system?
              </label>
              <textarea
                id="problem"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the main problems that require change..."
                rows={4}
              />
            </div>
          </section>

          {/* Research Questions */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Research Questions</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Formulate key questions you want to answer through system mapping. Questions typically
                start with "Why..." or "What factors influence..." These questions will guide your
                exploration and analysis.
              </p>
            </div>

            <div className="list-container">
              {researchQuestions.map((question) => (
                <div key={question.id} className="list-item">
                  <span className="list-item-text">{question.text}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeResearchQuestion(question.id)}
                    title="Remove question"
                  >
                    ×
                  </button>
                </div>
              ))}

              {researchQuestions.length === 0 && (
                <div className="empty-list">
                  No research questions yet. Add your first question below.
                </div>
              )}
            </div>

            <div className="add-item-form">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Why does... or What factors influence..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addResearchQuestion();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={addResearchQuestion}
                disabled={!newQuestion.trim()}
              >
                Add Question
              </button>
            </div>
          </section>

          {/* System Mapping Goals */}
          <section className="phase-section">
            <div className="section-header">
              <h2>System Mapping Goals</h2>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="help-text">
              <p>
                Define the overarching goals you want to achieve with your map. Consider learning
                goals, decision-making goals, and communication goals.
              </p>
            </div>

            <div className="list-container">
              {goals.map((goal) => (
                <div key={goal.id} className="list-item">
                  <span className="list-item-text">{goal.text}</span>
                  <button
                    className="btn-remove"
                    onClick={() => removeGoal(goal.id)}
                    title="Remove goal"
                  >
                    ×
                  </button>
                </div>
              ))}

              {goals.length === 0 && (
                <div className="empty-list">No goals yet. Add your first goal below.</div>
              )}
            </div>

            <div className="add-item-form">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter a goal for your system map..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGoal();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={addGoal}
                disabled={!newGoal.trim()}
              >
                Add Goal
              </button>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="phase-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Projects
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleComplete}
              disabled={!canComplete}
              title={
                !canComplete
                  ? 'Complete all required fields to proceed'
                  : 'Complete this phase and move to Explore'
              }
            >
              Complete Frame Phase →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
