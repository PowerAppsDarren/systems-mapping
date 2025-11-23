import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../context/ProjectContext';
import { Layout } from '../components/Layout';
import type { RegionStory, StakeholderFeedback } from '../types';
import { isPhaseComplete } from '../utils/projectUtils';
import './FramePhase.css';
import './ReflectPhase.css';

export function ReflectPhase() {
  const navigate = useNavigate();
  const { currentProject, updateProject, completePhase } = useProject();

  if (!currentProject) {
    navigate('/');
    return null;
  }

  const { reflectPhase, mapPhase } = currentProject;

  const [insights, setInsights] = useState(reflectPhase.insights);
  const [regionStories, setRegionStories] = useState<RegionStory[]>(reflectPhase.regionStories);
  const [coreSystemsStory, setCoreSystemsStory] = useState(reflectPhase.coreSystemsStory);
  const [stakeholderFeedback, setStakeholderFeedback] = useState<StakeholderFeedback[]>(
    reflectPhase.stakeholderFeedback
  );
  const [newFeedbackName, setNewFeedbackName] = useState('');
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [newFeedbackCategory, setNewFeedbackCategory] = useState<
    'resonates' | 'inaccurate' | 'missing_perspective'
  >('resonates');

  // Auto-save changes
  useEffect(() => {
    if (currentProject) {
      updateProject({
        reflectPhase: {
          ...reflectPhase,
          insights,
          regionStories,
          coreSystemsStory,
          stakeholderFeedback,
        },
      });
    }
  }, [insights, regionStories, coreSystemsStory, stakeholderFeedback]);

  // Initialize region stories for any new regions
  useEffect(() => {
    const existingRegionIds = regionStories.map((rs) => rs.regionId);
    const newRegionStories = mapPhase.regions
      .filter((region) => !existingRegionIds.includes(region.id))
      .map(
        (region): RegionStory => ({
          id: uuidv4(),
          regionId: region.id,
          dynamics: '',
          feedbackLoops: [],
          createdAt: new Date().toISOString(),
        })
      );

    if (newRegionStories.length > 0) {
      setRegionStories([...regionStories, ...newRegionStories]);
    }
  }, [mapPhase.regions]);

  const updateRegionStory = (regionId: string, dynamics: string) => {
    setRegionStories(
      regionStories.map((story) =>
        story.regionId === regionId ? { ...story, dynamics } : story
      )
    );
  };

  const addStakeholderFeedback = () => {
    if (!newFeedbackName.trim() || !newFeedbackText.trim()) {
      alert('Please enter stakeholder name and feedback');
      return;
    }

    const feedback: StakeholderFeedback = {
      id: uuidv4(),
      stakeholder: newFeedbackName.trim(),
      feedback: newFeedbackText.trim(),
      date: new Date().toISOString(),
      category: newFeedbackCategory,
    };

    setStakeholderFeedback([...stakeholderFeedback, feedback]);
    setNewFeedbackName('');
    setNewFeedbackText('');
    setNewFeedbackCategory('resonates');
  };

  const removeFeedback = (id: string) => {
    setStakeholderFeedback(stakeholderFeedback.filter((f) => f.id !== id));
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'resonates':
        return 'Resonates';
      case 'inaccurate':
        return 'Seems Inaccurate';
      case 'missing_perspective':
        return 'Missing Perspective';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'resonates':
        return 'var(--color-success)';
      case 'inaccurate':
        return 'var(--color-error)';
      case 'missing_perspective':
        return 'var(--color-warning)';
      default:
        return 'var(--color-gray-500)';
    }
  };

  const handleComplete = () => {
    if (isPhaseComplete(currentProject, 'reflect')) {
      completePhase('reflect');
      navigate('/project/leverage');
    } else {
      alert('Please complete insights and core systems story before proceeding');
    }
  };

  const canComplete = isPhaseComplete(currentProject, 'reflect');

  return (
    <Layout showPhaseNavigation>
      <div className="phase-page reflect-phase">
        <div className="phase-header">
          <h1>Reflect on the System</h1>
          <p className="phase-description">
            Synthesize your learnings and create narratives that explain system behavior and
            dynamics.
          </p>
        </div>

        <div className="phase-content">
          {/* Insights */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Key Insights</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Reflect on your mapping experience. What insights did you gain? What patterns
                emerged? Which feedback loops are most dominant? What surprised you?
              </p>
            </div>

            <div className="form-group">
              <textarea
                value={insights}
                onChange={(e) => setInsights(e.target.value)}
                placeholder="Document your key insights from the mapping process..."
                rows={8}
              />
            </div>
          </section>

          {/* Region Stories */}
          {mapPhase.regions.length > 0 && (
            <section className="phase-section">
              <div className="section-header">
                <h2>Region Stories</h2>
                <span className="optional-badge">Optional</span>
              </div>
              <div className="help-text">
                <p>
                  For each region you defined, describe the dynamics at play. How do the variables
                  in this region interact? What patterns of behavior emerge?
                </p>
              </div>

              <div className="region-stories-container">
                {mapPhase.regions.map((region) => {
                  const story = regionStories.find((s) => s.regionId === region.id);
                  const regionLoops = mapPhase.feedbackLoops.filter((loop) =>
                    loop.variables.some((varId) => region.variables.includes(varId))
                  );

                  return (
                    <div key={region.id} className="region-story-box">
                      <div
                        className="region-story-header"
                        style={{ backgroundColor: region.color }}
                      >
                        <h4>{region.name}</h4>
                        <span className="region-var-count">
                          {region.variables.length} variable{region.variables.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {regionLoops.length > 0 && (
                        <div className="region-loops-info">
                          <strong>Feedback Loops in this region:</strong>
                          <ul>
                            {regionLoops.map((loop) => (
                              <li key={loop.id}>
                                <span
                                  className={`loop-badge-small ${
                                    loop.type === 'reinforcing' ? 'reinforcing' : 'balancing'
                                  }`}
                                >
                                  {loop.type === 'reinforcing' ? 'R' : 'B'}
                                </span>
                                {loop.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="form-group">
                        <label>Describe the dynamics in this region:</label>
                        <textarea
                          value={story?.dynamics || ''}
                          onChange={(e) => updateRegionStory(region.id, e.target.value)}
                          placeholder="Explain how variables in this region interact and what patterns emerge..."
                          rows={4}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Core Systems Story */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Core Systems Story</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Synthesize everything into a coherent narrative. Explain what happened in the
                system and how it led to the current situation. Identify the 2-3 major feedback
                loops responsible for the problem.
              </p>
            </div>

            {mapPhase.feedbackLoops.length > 0 && (
              <div className="feedback-loops-reference">
                <strong>Your Feedback Loops:</strong>
                <div className="loops-reference-list">
                  {mapPhase.feedbackLoops.map((loop) => (
                    <div key={loop.id} className="loop-reference-item">
                      <span
                        className={`loop-badge-small ${
                          loop.type === 'reinforcing' ? 'reinforcing' : 'balancing'
                        }`}
                      >
                        {loop.type === 'reinforcing' ? 'R' : 'B'}
                      </span>
                      <span>{loop.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <textarea
                value={coreSystemsStory}
                onChange={(e) => setCoreSystemsStory(e.target.value)}
                placeholder="Write your systems story, explaining the causal mechanisms and major feedback loops driving the problem..."
                rows={10}
              />
            </div>
          </section>

          {/* Stakeholder Feedback */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Stakeholder Feedback</h2>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="help-text">
              <p>
                Collect feedback from stakeholders and experts. What resonates? What seems
                inaccurate? What perspectives might be missing?
              </p>
            </div>

            <div className="feedback-form">
              <div className="form-row">
                <input
                  type="text"
                  value={newFeedbackName}
                  onChange={(e) => setNewFeedbackName(e.target.value)}
                  placeholder="Stakeholder name..."
                />
                <select
                  value={newFeedbackCategory}
                  onChange={(e) =>
                    setNewFeedbackCategory(
                      e.target.value as 'resonates' | 'inaccurate' | 'missing_perspective'
                    )
                  }
                >
                  <option value="resonates">Resonates</option>
                  <option value="inaccurate">Seems Inaccurate</option>
                  <option value="missing_perspective">Missing Perspective</option>
                </select>
              </div>

              <textarea
                value={newFeedbackText}
                onChange={(e) => setNewFeedbackText(e.target.value)}
                placeholder="Enter their feedback..."
                rows={3}
              />

              <button
                className="btn btn-primary"
                onClick={addStakeholderFeedback}
                disabled={!newFeedbackName.trim() || !newFeedbackText.trim()}
              >
                Add Feedback
              </button>
            </div>

            {stakeholderFeedback.length > 0 && (
              <div className="feedback-list">
                {stakeholderFeedback.map((feedback) => (
                  <div key={feedback.id} className="feedback-item">
                    <div className="feedback-header">
                      <div className="feedback-meta">
                        <strong>{feedback.stakeholder}</strong>
                        <span
                          className="feedback-category"
                          style={{ backgroundColor: getCategoryColor(feedback.category || '') }}
                        >
                          {getCategoryLabel(feedback.category || '')}
                        </span>
                      </div>
                      <button
                        className="btn-icon-small"
                        onClick={() => removeFeedback(feedback.id)}
                      >
                        ×
                      </button>
                    </div>
                    <p className="feedback-text">{feedback.feedback}</p>
                    <div className="feedback-date">
                      {new Date(feedback.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="phase-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/project/map')}>
              ← Back to Map
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleComplete}
              disabled={!canComplete}
              title={
                !canComplete
                  ? 'Complete insights and core systems story to proceed'
                  : 'Complete this phase and move to Leverage'
              }
            >
              Complete Reflect Phase →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
