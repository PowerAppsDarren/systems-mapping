import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../context/ProjectContext';
import { Layout } from '../components/Layout';
import type { FeedbackLoop, Region } from '../types';
import { isPhaseComplete } from '../utils/projectUtils';
import './FramePhase.css';
import './MapPhase.css';

type ConnectionPolarity = 'positive' | 'negative';

export function MapPhase() {
  const navigate = useNavigate();
  const { currentProject, updateProject, completePhase } = useProject();

  if (!currentProject) {
    navigate('/');
    return null;
  }

  const { explorePhase, mapPhase } = currentProject;

  // Initialize nodes from variables
  const initializeNodes = (): Node[] => {
    if (mapPhase.variables.length > 0) {
      // Load from saved map
      return mapPhase.variables.map((mapVar) => {
        const variable = explorePhase.variables.find((v) => v.id === mapVar.variableId);
        return {
          id: mapVar.variableId,
          type: 'default',
          position: { x: mapVar.x, y: mapVar.y },
          data: { label: variable?.name || 'Unknown' },
        };
      });
    } else {
      // Initialize from main variable
      const mainVar = explorePhase.mainVariable;
      if (mainVar.name) {
        return [
          {
            id: 'main-variable',
            type: 'default',
            position: { x: 400, y: 300 },
            data: { label: mainVar.name },
            style: {
              background: '#2563eb',
              color: 'white',
              border: '2px solid #1e40af',
              fontWeight: 600,
              width: 200,
            },
          },
        ];
      }
    }
    return [];
  };

  const initializeEdges = (): Edge[] => {
    return mapPhase.connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      label: conn.polarity === 'positive' ? '+' : '-',
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: conn.polarity === 'positive' ? '#10b981' : '#ef4444',
        strokeWidth: 2,
      },
      labelStyle: {
        fill: conn.polarity === 'positive' ? '#10b981' : '#ef4444',
        fontWeight: 700,
        fontSize: 16,
      },
    }));
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initializeNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(initializeEdges());
  const [feedbackLoops, setFeedbackLoops] = useState<FeedbackLoop[]>(mapPhase.feedbackLoops);
  const [regions, setRegions] = useState<Region[]>(mapPhase.regions);
  const [connectionPolarity, setConnectionPolarity] = useState<ConnectionPolarity>('positive');
  const [showVariablePalette, setShowVariablePalette] = useState(false);
  const [newLoopName, setNewLoopName] = useState('');
  const [newLoopType, setNewLoopType] = useState<'reinforcing' | 'balancing'>('reinforcing');
  const [selectedNodesForLoop, setSelectedNodesForLoop] = useState<string[]>([]);
  const [newRegionName, setNewRegionName] = useState('');
  const [selectedNodesForRegion, setSelectedNodesForRegion] = useState<string[]>([]);

  // Save to project when nodes or edges change
  useEffect(() => {
    const mapVariables = nodes.map((node) => ({
      id: uuidv4(),
      variableId: node.id,
      x: node.position.x,
      y: node.position.y,
    }));

    const connections = edges.map((edge) => {
      const polarity = edge.label === '+' ? 'positive' : 'negative';
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        polarity: polarity as ConnectionPolarity,
      };
    });

    updateProject({
      mapPhase: {
        ...mapPhase,
        variables: mapVariables,
        connections,
        feedbackLoops,
        regions,
      },
    });
  }, [nodes, edges, feedbackLoops, regions]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: uuidv4(),
        label: connectionPolarity === 'positive' ? '+' : '-',
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          stroke: connectionPolarity === 'positive' ? '#10b981' : '#ef4444',
          strokeWidth: 2,
        },
        labelStyle: {
          fill: connectionPolarity === 'positive' ? '#10b981' : '#ef4444',
          fontWeight: 700,
          fontSize: 16,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [connectionPolarity, setEdges]
  );

  const addVariableToMap = (variableId: string) => {
    const variable = explorePhase.variables.find((v) => v.id === variableId);
    if (!variable) return;

    // Check if already on map
    if (nodes.find((n) => n.id === variableId)) {
      alert('This variable is already on the map');
      return;
    }

    const newNode: Node = {
      id: variableId,
      type: 'default',
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 400 + 100,
      },
      data: { label: variable.name },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const addFeedbackLoop = () => {
    if (!newLoopName.trim() || selectedNodesForLoop.length < 2) {
      alert('Please enter a loop name and select at least 2 variables');
      return;
    }

    const loop: FeedbackLoop = {
      id: uuidv4(),
      name: newLoopName.trim(),
      type: newLoopType,
      variables: selectedNodesForLoop,
      createdAt: new Date().toISOString(),
    };

    setFeedbackLoops([...feedbackLoops, loop]);
    setNewLoopName('');
    setSelectedNodesForLoop([]);
  };

  const removeFeedbackLoop = (id: string) => {
    setFeedbackLoops(feedbackLoops.filter((loop) => loop.id !== id));
  };

  const toggleNodeForLoop = (nodeId: string) => {
    if (selectedNodesForLoop.includes(nodeId)) {
      setSelectedNodesForLoop(selectedNodesForLoop.filter((id) => id !== nodeId));
    } else {
      setSelectedNodesForLoop([...selectedNodesForLoop, nodeId]);
    }
  };

  const addRegion = () => {
    if (!newRegionName.trim() || selectedNodesForRegion.length === 0) {
      alert('Please enter a region name and select at least 1 variable');
      return;
    }

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    const region: Region = {
      id: uuidv4(),
      name: newRegionName.trim(),
      variables: selectedNodesForRegion,
      color: colors[regions.length % colors.length],
      createdAt: new Date().toISOString(),
    };

    setRegions([...regions, region]);
    setNewRegionName('');
    setSelectedNodesForRegion([]);
  };

  const removeRegion = (id: string) => {
    setRegions(regions.filter((region) => region.id !== id));
  };

  const toggleNodeForRegion = (nodeId: string) => {
    if (selectedNodesForRegion.includes(nodeId)) {
      setSelectedNodesForRegion(selectedNodesForRegion.filter((id) => id !== nodeId));
    } else {
      setSelectedNodesForRegion([...selectedNodesForRegion, nodeId]);
    }
  };

  const handleComplete = () => {
    if (isPhaseComplete(currentProject, 'map')) {
      completePhase('map');
      navigate('/project/reflect');
    } else {
      alert('Please add at least one variable and one connection to complete this phase');
    }
  };

  const canComplete = isPhaseComplete(currentProject, 'map');
  const availableVariables = explorePhase.variables.filter(
    (v) => !nodes.find((n) => n.id === v.id)
  );

  return (
    <Layout showPhaseNavigation>
      <div className="phase-page map-phase">
        <div className="phase-header">
          <h1>Map the System</h1>
          <p className="phase-description">
            Visualize causal relationships, identify feedback loops, and discover system dynamics.
          </p>
        </div>

        <div className="map-content">
          {/* Main Canvas */}
          <div className="map-canvas-container">
            <div className="canvas-toolbar">
              <div className="toolbar-group">
                <label>Connection Type:</label>
                <button
                  className={`btn btn-sm ${
                    connectionPolarity === 'positive' ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setConnectionPolarity('positive')}
                >
                  + Positive
                </button>
                <button
                  className={`btn btn-sm ${
                    connectionPolarity === 'negative' ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setConnectionPolarity('negative')}
                >
                  - Negative
                </button>
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowVariablePalette(!showVariablePalette)}
              >
                {showVariablePalette ? 'Hide' : 'Show'} Variables
              </button>
            </div>

            <div className="map-canvas">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>

            {showVariablePalette && (
              <div className="variable-palette">
                <div className="palette-header">
                  <h4>Available Variables</h4>
                  <button
                    className="btn-icon-small"
                    onClick={() => setShowVariablePalette(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="palette-content">
                  {availableVariables.length === 0 ? (
                    <p className="empty-message">All variables are on the map</p>
                  ) : (
                    availableVariables.map((variable) => (
                      <button
                        key={variable.id}
                        className="palette-variable-btn"
                        onClick={() => addVariableToMap(variable.id)}
                      >
                        + {variable.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Loops Section */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Feedback Loops</h2>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="help-text">
              <p>
                Identify closed causal chains where variables influence each other in a circular
                pattern. Reinforcing loops (R) amplify change, while balancing loops (B) resist
                change.
              </p>
            </div>

            <div className="feedback-loop-form">
              <div className="form-row">
                <input
                  type="text"
                  value={newLoopName}
                  onChange={(e) => setNewLoopName(e.target.value)}
                  placeholder="Loop name (e.g., 'Growth Spiral', 'Limiting Factor')..."
                />
                <select
                  value={newLoopType}
                  onChange={(e) =>
                    setNewLoopType(e.target.value as 'reinforcing' | 'balancing')
                  }
                >
                  <option value="reinforcing">Reinforcing (R)</option>
                  <option value="balancing">Balancing (B)</option>
                </select>
              </div>

              <div className="node-selector">
                <label>Select variables in the loop:</label>
                <div className="node-chips">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      className={`chip ${
                        selectedNodesForLoop.includes(node.id) ? 'selected' : ''
                      }`}
                      onClick={() => toggleNodeForLoop(node.id)}
                    >
                      {node.data.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={addFeedbackLoop}
                disabled={!newLoopName.trim() || selectedNodesForLoop.length < 2}
              >
                Add Feedback Loop
              </button>
            </div>

            {feedbackLoops.length > 0 && (
              <div className="loops-list">
                {feedbackLoops.map((loop) => (
                  <div key={loop.id} className="loop-item">
                    <div className="loop-header">
                      <span
                        className={`loop-badge ${
                          loop.type === 'reinforcing' ? 'reinforcing' : 'balancing'
                        }`}
                      >
                        {loop.type === 'reinforcing' ? 'R' : 'B'}
                      </span>
                      <span className="loop-name">{loop.name}</span>
                      <button
                        className="btn-icon-small"
                        onClick={() => removeFeedbackLoop(loop.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="loop-variables">
                      {loop.variables.map((varId, idx) => {
                        const node = nodes.find((n) => n.id === varId);
                        return (
                          <span key={varId}>
                            {node?.data.label}
                            {idx < loop.variables.length - 1 ? ' → ' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Regions Section */}
          <section className="phase-section">
            <div className="section-header">
              <h2>Regions</h2>
              <span className="optional-badge">Optional</span>
            </div>
            <div className="help-text">
              <p>
                Group related variables into thematic regions to identify different areas of your
                system.
              </p>
            </div>

            <div className="region-form">
              <input
                type="text"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="Region name (e.g., 'Environmental Factors')..."
              />

              <div className="node-selector">
                <label>Select variables for this region:</label>
                <div className="node-chips">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      className={`chip ${
                        selectedNodesForRegion.includes(node.id) ? 'selected' : ''
                      }`}
                      onClick={() => toggleNodeForRegion(node.id)}
                    >
                      {node.data.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={addRegion}
                disabled={!newRegionName.trim() || selectedNodesForRegion.length === 0}
              >
                Add Region
              </button>
            </div>

            {regions.length > 0 && (
              <div className="regions-list">
                {regions.map((region) => (
                  <div key={region.id} className="region-item">
                    <div
                      className="region-header"
                      style={{ backgroundColor: region.color }}
                    >
                      <span className="region-name">{region.name}</span>
                      <button
                        className="btn-icon-small"
                        onClick={() => removeRegion(region.id)}
                        style={{ color: 'white' }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="region-variables">
                      {region.variables.map((varId) => {
                        const node = nodes.find((n) => n.id === varId);
                        return (
                          <span key={varId} className="region-var-chip">
                            {node?.data.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="phase-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/project/explore')}>
              ← Back to Explore
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleComplete}
              disabled={!canComplete}
              title={
                !canComplete
                  ? 'Add at least one variable and one connection to proceed'
                  : 'Complete this phase and move to Reflect'
              }
            >
              Complete Map Phase →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
