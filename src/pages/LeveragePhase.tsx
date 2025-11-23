import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../context/ProjectContext';
import { Layout } from '../components/Layout';
import type { AnalysisMarker, LeveragePoint, AnalysisMarkerType } from '../types';
import { isPhaseComplete } from '../utils/projectUtils';
import './FramePhase.css';
import './LeveragePhase.css';

export function LeveragePhase() {
  const navigate = useNavigate();
  const { currentProject, updateProject, completePhase } = useProject();

  if (!currentProject) {
    navigate('/');
    return null;
  }

  const { leveragePhase, mapPhase, explorePhase } = currentProject;

  const [systemVision, setSystemVision] = useState(leveragePhase.systemVision);
  const [analysisMarkers, setAnalysisMarkers] = useState<AnalysisMarker[]>(
    leveragePhase.analysisMarkers
  );
  const [leveragePoints, setLeveragePoints] = useState<LeveragePoint[]>(
    leveragePhase.leveragePoints
  );

  // New marker state
  const [newMarkerType, setNewMarkerType] = useState<AnalysisMarkerType>('ripple_effect');
  const [newMarkerVariableId, setNewMarkerVariableId] = useState('');
  const [newMarkerNotes, setNewMarkerNotes] = useState('');

  // New leverage point state
  const [newLpName, setNewLpName] = useState('');
  const [newLpDescription, setNewLpDescription] = useState('');
  const [newLpLocationType, setNewLpLocationType] = useState<'variable' | 'feedback_loop' | 'region'>('variable');
  const [newLpLocationId, setNewLpLocationId] = useState('');
  const [newLpShortTerm, setNewLpShortTerm] = useState('');
  const [newLpLongTerm, setNewLpLongTerm] = useState('');
  const [newLpQuestions, setNewLpQuestions] = useState('');

  // Auto-save changes
  useEffect(() => {
    if (currentProject) {
      updateProject({
        leveragePhase: {
          ...leveragePhase,
          systemVision,
          analysisMarkers,
          leveragePoints,
        },
      });
    }
  }, [systemVision, analysisMarkers, leveragePoints]);

  const getMarkerTypeLabel = (type: AnalysisMarkerType) => {
    switch (type) {
      case 'ripple_effect':
        return 'Ripple Effect';
      case 'frozen_area':
        return 'Frozen Area';
      case 'potential_for_change':
        return 'Potential for Change';
      case 'positive_change_happening':
        return 'Positive Change Happening';
      default:
        return type;
    }
  };

  const getMarkerTypeIcon = (type: AnalysisMarkerType) => {
    switch (type) {
      case 'ripple_effect':
        return '🌊';
      case 'frozen_area':
        return '🧊';
      case 'potential_for_change':
        return '💡';
      case 'positive_change_happening':
        return '✨';
      default:
        return '📍';
    }
  };

  const getMarkerTypeColor = (type: AnalysisMarkerType) => {
    switch (type) {
      case 'ripple_effect':
        return 'var(--color-primary)';
      case 'frozen_area':
        return 'var(--color-gray-500)';
      case 'potential_for_change':
        return 'var(--color-warning)';
      case 'positive_change_happening':
        return 'var(--color-success)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const addAnalysisMarker = () => {
    if (!newMarkerVariableId || !newMarkerNotes.trim()) {
      alert('Please select a variable and add notes');
      return;
    }

    const marker: AnalysisMarker = {
      id: uuidv4(),
      type: newMarkerType,
      variableId: newMarkerVariableId,
      notes: newMarkerNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    setAnalysisMarkers([...analysisMarkers, marker]);
    setNewMarkerVariableId('');
    setNewMarkerNotes('');
  };

  const removeAnalysisMarker = (id: string) => {
    setAnalysisMarkers(analysisMarkers.filter((m) => m.id !== id));
  };

  const addLeveragePoint = () => {
    if (
      !newLpName.trim() ||
      !newLpDescription.trim() ||
      !newLpLocationId ||
      !newLpShortTerm.trim() ||
      !newLpLongTerm.trim()
    ) {
      alert('Please complete all required fields for the leverage point');
      return;
    }

    const questions = newLpQuestions
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    const lp: LeveragePoint = {
      id: uuidv4(),
      name: newLpName.trim(),
      description: newLpDescription.trim(),
      locationRef: {
        type: newLpLocationType,
        id: newLpLocationId,
      },
      shortTermInfluence: newLpShortTerm.trim(),
      longTermImpact: newLpLongTerm.trim(),
      brainstormingQuestions: questions,
      createdAt: new Date().toISOString(),
    };

    setLeveragePoints([...leveragePoints, lp]);

    // Reset form
    setNewLpName('');
    setNewLpDescription('');
    setNewLpLocationId('');
    setNewLpShortTerm('');
    setNewLpLongTerm('');
    setNewLpQuestions('');
  };

  const removeLeveragePoint = (id: string) => {
    setLeveragePoints(leveragePoints.filter((lp) => lp.id !== id));
  };

  const getLocationName = (lp: LeveragePoint) => {
    if (lp.locationRef.type === 'variable') {
      const variable = explorePhase.variables.find((v) => v.id === lp.locationRef.id);
      return variable?.name || 'Unknown Variable';
    } else if (lp.locationRef.type === 'feedback_loop') {
      const loop = mapPhase.feedbackLoops.find((l) => l.id === lp.locationRef.id);
      return loop?.name || 'Unknown Loop';
    } else if (lp.locationRef.type === 'region') {
      const region = mapPhase.regions.find((r) => r.id === lp.locationRef.id);
      return region?.name || 'Unknown Region';
    }
    return 'Unknown';
  };

  const handleComplete = () => {
    if (isPhaseComplete(currentProject, 'leverage')) {
      completePhase('leverage');
      alert('Congratulations! You have completed all phases of the System Mapping Toolkit!');
      navigate('/');
    } else {
      alert('Please complete system vision and add at least one leverage point');
    }
  };

  const canComplete = isPhaseComplete(currentProject, 'leverage');

  // Get available map elements
  const availableVariables = explorePhase.variables;
  const availableLoops = mapPhase.feedbackLoops;
  const availableRegions = mapPhase.regions;

  const getLocationOptions = () => {
    if (newLpLocationType === 'variable') {
      return availableVariables;
    } else if (newLpLocationType === 'feedback_loop') {
      return availableLoops;
    } else if (newLpLocationType === 'region') {
      return availableRegions;
    }
    return [];
  };

  return (
    <Layout showPhaseNavigation>
      <div className="phase-page leverage-phase">
        <div className="phase-header">
          <h1>Leverage for Change</h1>
          <p className="phase-description">
            Identify opportunities for positive intervention in your system and develop strategies
            for creating meaningful change.
          </p>
        </div>

        <div className="phase-content">
          {/* System Vision */}
          <section className="phase-section">
            <div className="section-header">
              <h2>System Vision</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Articulate your desired future state. How would the system function ideally? What
                positive impact would it have? This vision guides your leverage point selection.
              </p>
            </div>

            <div className="form-group">
              <textarea
                value={systemVision}
                onChange={(e) => setSystemVision(e.target.value)}
                placeholder="Describe your vision for how the system should function in the future..."
                rows={6}
              />
            </div>
          </section>

          {/* Map Analysis */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Map Analysis</h2>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="help-text">
              <p>
                Systematically examine your map to identify promising intervention areas. Mark
                variables or loops that show ripple effects, frozen areas, potential for change, or
                where positive change is already happening.
              </p>
            </div>

            <div className="analysis-form">
              <div className="form-row">
                <select
                  value={newMarkerType}
                  onChange={(e) => setNewMarkerType(e.target.value as AnalysisMarkerType)}
                >
                  <option value="ripple_effect">🌊 Ripple Effect</option>
                  <option value="frozen_area">🧊 Frozen Area</option>
                  <option value="potential_for_change">💡 Potential for Change</option>
                  <option value="positive_change_happening">✨ Positive Change Happening</option>
                </select>

                <select
                  value={newMarkerVariableId}
                  onChange={(e) => setNewMarkerVariableId(e.target.value)}
                >
                  <option value="">Select variable...</option>
                  {availableVariables.map((variable) => (
                    <option key={variable.id} value={variable.id}>
                      {variable.name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={newMarkerNotes}
                onChange={(e) => setNewMarkerNotes(e.target.value)}
                placeholder="Add notes about why you marked this..."
                rows={2}
              />

              <button
                className="btn btn-primary"
                onClick={addAnalysisMarker}
                disabled={!newMarkerVariableId || !newMarkerNotes.trim()}
              >
                Add Analysis Marker
              </button>
            </div>

            {analysisMarkers.length > 0 && (
              <div className="markers-list">
                {analysisMarkers.map((marker) => {
                  const variable = availableVariables.find((v) => v.id === marker.variableId);
                  return (
                    <div key={marker.id} className="marker-item">
                      <div className="marker-header">
                        <span
                          className="marker-icon"
                          style={{ color: getMarkerTypeColor(marker.type) }}
                        >
                          {getMarkerTypeIcon(marker.type)}
                        </span>
                        <span className="marker-type">{getMarkerTypeLabel(marker.type)}</span>
                        <span className="marker-variable">→ {variable?.name}</span>
                        <button
                          className="btn-icon-small"
                          onClick={() => removeAnalysisMarker(marker.id)}
                        >
                          ×
                        </button>
                      </div>
                      <p className="marker-notes">{marker.notes}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Leverage Points */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Leverage Points</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Define specific leverage points where interventions could create positive change.
                Consider your analysis markers and focus on areas with high potential impact.
              </p>
            </div>

            <div className="leverage-point-form">
              <div className="form-group">
                <label>Leverage Point Name</label>
                <input
                  type="text"
                  value={newLpName}
                  onChange={(e) => setNewLpName(e.target.value)}
                  placeholder="e.g., 'Strengthen Teacher Support Networks'"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newLpDescription}
                  onChange={(e) => setNewLpDescription(e.target.value)}
                  placeholder="Describe this leverage point and why it's important..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: '0 0 200px' }}>
                  <label>Location Type</label>
                  <select
                    value={newLpLocationType}
                    onChange={(e) => {
                      setNewLpLocationType(e.target.value as 'variable' | 'feedback_loop' | 'region');
                      setNewLpLocationId('');
                    }}
                  >
                    <option value="variable">Variable</option>
                    <option value="feedback_loop">Feedback Loop</option>
                    <option value="region">Region</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Location</label>
                  <select
                    value={newLpLocationId}
                    onChange={(e) => setNewLpLocationId(e.target.value)}
                  >
                    <option value="">Select {newLpLocationType}...</option>
                    {getLocationOptions().map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Short-Term Influence</label>
                <textarea
                  value={newLpShortTerm}
                  onChange={(e) => setNewLpShortTerm(e.target.value)}
                  placeholder="What direct, immediate effects could this leverage point have?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Long-Term Impact</label>
                <textarea
                  value={newLpLongTerm}
                  onChange={(e) => setNewLpLongTerm(e.target.value)}
                  placeholder="How could this contribute to your desired future system over time?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Brainstorming Questions (one per line)</label>
                <textarea
                  value={newLpQuestions}
                  onChange={(e) => setNewLpQuestions(e.target.value)}
                  placeholder="How might we...&#10;What if we...&#10;Could we..."
                  rows={4}
                />
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={addLeveragePoint}
                disabled={
                  !newLpName.trim() ||
                  !newLpDescription.trim() ||
                  !newLpLocationId ||
                  !newLpShortTerm.trim() ||
                  !newLpLongTerm.trim()
                }
              >
                Add Leverage Point
              </button>
            </div>

            {leveragePoints.length > 0 && (
              <div className="leverage-points-list">
                {leveragePoints.map((lp, index) => (
                  <div key={lp.id} className="leverage-point-card">
                    <div className="lp-card-header">
                      <div className="lp-number">{index + 1}</div>
                      <div className="lp-title">
                        <h4>{lp.name}</h4>
                        <div className="lp-location">
                          📍 {lp.locationRef.type.replace('_', ' ')}: {getLocationName(lp)}
                        </div>
                      </div>
                      <button
                        className="btn-icon-small"
                        onClick={() => removeLeveragePoint(lp.id)}
                      >
                        ×
                      </button>
                    </div>

                    <div className="lp-card-body">
                      <div className="lp-section">
                        <strong>Description:</strong>
                        <p>{lp.description}</p>
                      </div>

                      <div className="lp-section">
                        <strong>Short-Term Influence:</strong>
                        <p>{lp.shortTermInfluence}</p>
                      </div>

                      <div className="lp-section">
                        <strong>Long-Term Impact:</strong>
                        <p>{lp.longTermImpact}</p>
                      </div>

                      {lp.brainstormingQuestions.length > 0 && (
                        <div className="lp-section">
                          <strong>Brainstorming Questions:</strong>
                          <ul>
                            {lp.brainstormingQuestions.map((question, idx) => (
                              <li key={idx}>{question}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="phase-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/project/reflect')}>
              ← Back to Reflect
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleComplete}
              disabled={!canComplete}
              title={
                !canComplete
                  ? 'Complete system vision and add at least one leverage point'
                  : 'Complete this phase'
              }
            >
              Complete Leverage Phase ✓
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
