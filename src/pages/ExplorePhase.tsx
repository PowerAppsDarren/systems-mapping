import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../context/ProjectContext';
import { Layout } from '../components/Layout';
import type { Variable, Cluster } from '../types';
import { isPhaseComplete } from '../utils/projectUtils';
import './FramePhase.css';
import './ExplorePhase.css';

const CLUSTER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#ef4444', '#84cc16', '#f97316',
];

export function ExplorePhase() {
  const navigate = useNavigate();
  const { currentProject, updateProject, completePhase } = useProject();

  if (!currentProject) {
    navigate('/');
    return null;
  }

  const { explorePhase } = currentProject;

  const [mainVariableName, setMainVariableName] = useState(explorePhase.mainVariable.name);
  const [mainVariableDefinition, setMainVariableDefinition] = useState(
    explorePhase.mainVariable.definition
  );
  const [variables, setVariables] = useState<Variable[]>(explorePhase.variables);
  const [clusters, setClusters] = useState<Cluster[]>(explorePhase.clusters);
  const [notes, setNotes] = useState(explorePhase.notes);
  const [newVariableName, setNewVariableName] = useState('');
  const [newClusterName, setNewClusterName] = useState('');
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [editingVariableName, setEditingVariableName] = useState('');

  // Auto-save changes
  useEffect(() => {
    if (currentProject) {
      updateProject({
        explorePhase: {
          ...explorePhase,
          mainVariable: {
            name: mainVariableName,
            definition: mainVariableDefinition,
          },
          variables,
          clusters,
          notes,
        },
      });
    }
  }, [mainVariableName, mainVariableDefinition, variables, clusters, notes]);

  const addVariable = () => {
    if (newVariableName.trim()) {
      const variable: Variable = {
        id: uuidv4(),
        name: newVariableName.trim(),
        createdAt: new Date().toISOString(),
      };
      setVariables([...variables, variable]);
      setNewVariableName('');
    }
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
    // Remove from clusters
    setClusters(
      clusters.map((cluster) => ({
        ...cluster,
        variables: cluster.variables.filter((vId) => vId !== id),
      }))
    );
  };

  const startEditingVariable = (variable: Variable) => {
    setEditingVariableId(variable.id);
    setEditingVariableName(variable.name);
  };

  const saveVariableEdit = () => {
    if (editingVariableId && editingVariableName.trim()) {
      setVariables(
        variables.map((v) =>
          v.id === editingVariableId ? { ...v, name: editingVariableName.trim() } : v
        )
      );
      setEditingVariableId(null);
      setEditingVariableName('');
    }
  };

  const cancelVariableEdit = () => {
    setEditingVariableId(null);
    setEditingVariableName('');
  };

  const addCluster = () => {
    if (newClusterName.trim()) {
      const cluster: Cluster = {
        id: uuidv4(),
        name: newClusterName.trim(),
        color: CLUSTER_COLORS[clusters.length % CLUSTER_COLORS.length],
        variables: [],
        createdAt: new Date().toISOString(),
      };
      setClusters([...clusters, cluster]);
      setNewClusterName('');
    }
  };

  const removeCluster = (id: string) => {
    // Unassign variables from this cluster
    setVariables(
      variables.map((v) => (v.clusterId === id ? { ...v, clusterId: undefined } : v))
    );
    setClusters(clusters.filter((c) => c.id !== id));
  };

  const assignVariableToCluster = (variableId: string, clusterId: string | null) => {
    setVariables(
      variables.map((v) =>
        v.id === variableId ? { ...v, clusterId: clusterId || undefined } : v
      )
    );

    // Update cluster's variable list
    if (clusterId) {
      setClusters(
        clusters.map((cluster) => {
          if (cluster.id === clusterId) {
            return {
              ...cluster,
              variables: cluster.variables.includes(variableId)
                ? cluster.variables
                : [...cluster.variables, variableId],
            };
          } else {
            return {
              ...cluster,
              variables: cluster.variables.filter((vId) => vId !== variableId),
            };
          }
        })
      );
    } else {
      // Remove from all clusters
      setClusters(
        clusters.map((cluster) => ({
          ...cluster,
          variables: cluster.variables.filter((vId) => vId !== variableId),
        }))
      );
    }
  };

  const getVariableCluster = (variableId: string) => {
    return clusters.find((c) => c.variables.includes(variableId));
  };

  const handleComplete = () => {
    if (isPhaseComplete(currentProject, 'explore')) {
      completePhase('explore');
      navigate('/project/map');
    } else {
      alert(
        'Please complete all required fields:\n- Main variable name and definition\n- At least one variable'
      );
    }
  };

  const canComplete = isPhaseComplete(currentProject, 'explore');
  const unclusteredVariables = variables.filter((v) => !v.clusterId);

  return (
    <Layout showPhaseNavigation>
      <div className="phase-page explore-phase">
        <div className="phase-header">
          <h1>Explore the System</h1>
          <p className="phase-description">
            Identify and organize the variables that comprise your system. Define your main variable,
            collect related variables, and organize them into thematic clusters.
          </p>
        </div>

        <div className="phase-content">
          {/* Main Variable */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Main Variable</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Define the central variable that represents your key issue. This should be derived
                from your research question and will be the focal point of your system map.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="main-var-name">Main Variable Name</label>
              <input
                id="main-var-name"
                type="text"
                value={mainVariableName}
                onChange={(e) => setMainVariableName(e.target.value)}
                placeholder="e.g., Student Dropout Rate, Carbon Emissions, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="main-var-definition">
                Main Variable Definition (2-3 sentences)
              </label>
              <textarea
                id="main-var-definition"
                value={mainVariableDefinition}
                onChange={(e) => setMainVariableDefinition(e.target.value)}
                placeholder="Provide a clear definition of what this variable means and how it's measured..."
                rows={3}
              />
            </div>
          </section>

          {/* Variable Collection */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Variable Collection</h2>
              <span className="required-badge">Required</span>
            </div>
            <div className="help-text">
              <p>
                Brainstorm and document all variables that influence your main variable. Think
                broadly about environmental, social, technological, political, and economic factors.
              </p>
            </div>

            <div className="add-item-form mb-lg">
              <input
                type="text"
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                placeholder="Enter a variable name..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addVariable();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={addVariable}
                disabled={!newVariableName.trim()}
              >
                Add Variable
              </button>
            </div>

            <div className="variables-grid">
              {variables.length === 0 ? (
                <div className="empty-list">
                  No variables yet. Add your first variable above.
                </div>
              ) : (
                variables.map((variable) => {
                  const cluster = getVariableCluster(variable.id);
                  const isEditing = editingVariableId === variable.id;

                  return (
                    <div
                      key={variable.id}
                      className="variable-card"
                      style={{
                        borderLeftColor: cluster?.color || 'var(--border-color)',
                        borderLeftWidth: '4px',
                      }}
                    >
                      {isEditing ? (
                        <div className="variable-edit-form">
                          <input
                            type="text"
                            value={editingVariableName}
                            onChange={(e) => setEditingVariableName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                saveVariableEdit();
                              } else if (e.key === 'Escape') {
                                cancelVariableEdit();
                              }
                            }}
                            autoFocus
                          />
                          <div className="edit-actions">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={saveVariableEdit}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={cancelVariableEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="variable-name">{variable.name}</div>
                          {cluster && (
                            <div
                              className="variable-cluster-badge"
                              style={{ backgroundColor: cluster.color }}
                            >
                              {cluster.name}
                            </div>
                          )}
                          <div className="variable-actions">
                            <button
                              className="btn-icon-small"
                              onClick={() => startEditingVariable(variable)}
                              title="Edit variable"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon-small"
                              onClick={() => removeVariable(variable.id)}
                              title="Remove variable"
                            >
                              🗑
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="stats-bar">
              <span>Total Variables: {variables.length}</span>
              <span>Clustered: {variables.filter((v) => v.clusterId).length}</span>
              <span>Unclustered: {unclusteredVariables.length}</span>
            </div>
          </section>

          {/* Clustering */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Variable Clustering</h2>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="help-text">
              <p>
                Organize your variables into thematic groups. Clusters might represent different
                aspects like environmental, social, technological, political, or economic dimensions.
              </p>
            </div>

            <div className="add-item-form mb-lg">
              <input
                type="text"
                value={newClusterName}
                onChange={(e) => setNewClusterName(e.target.value)}
                placeholder="Enter cluster name (e.g., Environmental Factors)..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addCluster();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={addCluster}
                disabled={!newClusterName.trim()}
              >
                Create Cluster
              </button>
            </div>

            {clusters.length > 0 && (
              <div className="clusters-container">
                {clusters.map((cluster) => {
                  const clusterVariables = variables.filter((v) => v.clusterId === cluster.id);

                  return (
                    <div key={cluster.id} className="cluster-box">
                      <div
                        className="cluster-header"
                        style={{ backgroundColor: cluster.color }}
                      >
                        <h4>{cluster.name}</h4>
                        <span className="cluster-count">
                          {clusterVariables.length} variable{clusterVariables.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          className="btn-icon-small"
                          onClick={() => removeCluster(cluster.id)}
                          title="Remove cluster"
                          style={{ color: 'white' }}
                        >
                          ×
                        </button>
                      </div>
                      <div className="cluster-variables">
                        {clusterVariables.length === 0 ? (
                          <div className="empty-cluster">
                            No variables in this cluster yet. Assign variables below.
                          </div>
                        ) : (
                          clusterVariables.map((variable) => (
                            <div key={variable.id} className="cluster-variable-item">
                              <span>{variable.name}</span>
                              <button
                                className="btn-icon-small"
                                onClick={() => assignVariableToCluster(variable.id, null)}
                                title="Remove from cluster"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Unclustered Variables */}
            {unclusteredVariables.length > 0 && clusters.length > 0 && (
              <div className="unclustered-section">
                <h4>Unclustered Variables</h4>
                <p className="help-text-small">
                  Assign these variables to clusters by selecting a cluster for each:
                </p>
                <div className="unclustered-variables">
                  {unclusteredVariables.map((variable) => (
                    <div key={variable.id} className="unclustered-variable-item">
                      <span className="variable-name">{variable.name}</span>
                      <select
                        value=""
                        onChange={(e) =>
                          assignVariableToCluster(
                            variable.id,
                            e.target.value || null
                          )
                        }
                        className="cluster-select"
                      >
                        <option value="">Assign to cluster...</option>
                        {clusters.map((cluster) => (
                          <option key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Research Notes */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Research Notes</h2>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="help-text">
              <p>
                Document research sources, articles, interviews, or other information that informs
                your variable selection.
              </p>
            </div>

            <div className="form-group">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your research sources and methodology..."
                rows={6}
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="phase-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/project/frame')}>
              ← Back to Frame
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleComplete}
              disabled={!canComplete}
              title={
                !canComplete
                  ? 'Complete all required fields to proceed'
                  : 'Complete this phase and move to Map'
              }
            >
              Complete Explore Phase →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
