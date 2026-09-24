import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Container, Grid, CircularProgress, IconButton } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import GaugeChart from "react-gauge-chart";
//import WordCloud from "react-wordcloud";
import axios from "axios";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';

const VisualizationPage = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [uploadTrends, setUploadTrends] = useState([]);
  const [jobMatchScore, setJobMatchScore] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const [jobRoles, setJobRoles] = useState([]); // State for job roles data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreenCard, setFullscreenCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching visualization data...");
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/visualizations`);
        console.log("API Response:", response.data);
        
        // Ensure data has expected format
        if (response.data) {
          setSkillsData(Array.isArray(response.data.skills) ? response.data.skills : []);
          setUploadTrends(Array.isArray(response.data.uploadTrends) ? response.data.uploadTrends : []);
          setJobMatchScore(typeof response.data.jobMatchScore === 'number' ? response.data.jobMatchScore : 0);
          setKeywords(Array.isArray(response.data.keywords) ? response.data.keywords : []);
          setJobRoles(Array.isArray(response.data.jobRoles) ? response.data.jobRoles : []); // Set job roles data
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load visualization data. Please try again later.");
        // Set empty defaults
        setSkillsData([]);
        setUploadTrends([]);
        setJobMatchScore(0);
        setKeywords([]);
        setJobRoles([]); // Reset job roles data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Background effects component
  const BackgroundEffects = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'radial-gradient(circle, #003366, #000)',
        overflow: 'hidden'
      }}
    >
      {/* Grid background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage:
            'linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
          '@keyframes gridMove': {
            '0%': { backgroundPosition: '0px 0px' },
            '100%': { backgroundPosition: '50px 50px' }
          }
        }}
      />
      
      {/* Particle effects */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle, cyan 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.3
        }}
      />
      
      {/* Glow effect */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0,255,255,0.1) 0%, transparent 70%)',
          opacity: 0.4
        }}
      />
    </Box>
  );

  // Colors for the pie chart
  const pieColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  // Loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh' 
        }}
      >
        <BackgroundEffects />
        <CircularProgress sx={{ color: 'cyan', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'cyan' }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          p: 3
        }}
      >
        <BackgroundEffects />
        <Typography variant="h5" sx={{ color: 'red', mb: 2 }}>
          Error
        </Typography>
        <Typography variant="body1" sx={{ color: 'white' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  // Empty data check - display message if no data
  const hasData = skillsData.length > 0 || uploadTrends.length > 0 || keywords.length > 0 || jobMatchScore > 0;
  
  if (!hasData) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3
        }}
      >
        <BackgroundEffects />
        <Typography variant="h5" sx={{ color: 'cyan', mb: 2 }}>
          No Data Available
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', maxWidth: '600px' }}>
          There is no resume data available for visualization. Please upload resumes to view insights.
        </Typography>
      </Box>
    );
  }

  console.log("Rendering with data:", { skillsData, uploadTrends, jobMatchScore, keywords });

  // Fullscreen mode for a card
  const FullscreenCardView = () => {
    if (!fullscreenCard) return null;

    let content;
    const height = "85vh";

    switch (fullscreenCard) {
      case "skills":
        content = (
          <Box sx={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData}>
                <XAxis dataKey="skill" tick={{ fill: '#ffffff' }} />
                <YAxis tick={{ fill: '#ffffff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 25, 41, 0.9)', color: '#fff', border: '1px solid cyan' }}
                  formatter={(value) => [`${value} occurrences`, 'Count']}
                  labelFormatter={(value) => `Skill: ${value}`}
                />
                {/* Custom bar with labels inside */}
                <Bar dataKey="count" fill="#8884d8" name="Skill Frequency">
                  {(props) => {
                    const { x, y, width, height, value } = props;
                    // Removed the unused 'skill' variable from destructuring
                    return (
                      <g>
                        <rect x={x} y={y} width={width} height={height} fill="#8884d8" />
                        {width > 30 && (
                          <text 
                            x={x + width / 2} 
                            y={y + height / 2} 
                            fill="#ffffff" 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            fontSize={14}
                          >
                            {value}
                          </text>
                        )}
                      </g>
                    );
                  }}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
        break;
      case "jobMatch":
        content = (
          <Box sx={{ height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ width: '60%', maxWidth: '600px' }}>
              <GaugeChart 
                id="gauge-chart-fullscreen" 
                nrOfLevels={20} 
                percent={jobMatchScore / 100} 
                colors={["#FF5F6D", "#FFC371", "#00C853"]}
                textColor="#ffffff"
                arcWidth={0.3}
                cornerRadius={6}
              />
              <Typography 
                variant="h2" 
                align="center" 
                sx={{ 
                  mt: 4, 
                  color: jobMatchScore > 75 ? '#00C853' : jobMatchScore > 50 ? '#FFC371' : '#FF5F6D' 
                }}
              >
                {jobMatchScore}%
              </Typography>
            </Box>
          </Box>
        );
        break;
      case "uploadTrends":
        content = (
          <Box sx={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={uploadTrends}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#ffffff' }} 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis tick={{ fill: '#ffffff' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 25, 41, 0.9)', color: '#fff', border: '1px solid cyan' }}
                  formatter={(value) => [`${value} resumes`, 'Uploads']}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="uploads" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 6, fill: '#0a1929' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );
        break;
      
      case "jobRoles":
        content = (
          <Box sx={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={jobRoles} 
                  dataKey="percentage" 
                  nameKey="role" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={150} 
                  fill="#8884d8" 
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {jobRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );
        break;
      default:
        content = null;
    }

    const titles = {
      skills: "Skill Distribution",
      jobMatch: "Job Match Score",
      uploadTrends: "Resume Upload Trends",
      keywords: "Keyword Word Cloud",
      jobRoles: "Job Roles Distribution"
    };

    return (
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          p: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: 'cyan' }}>
            {titles[fullscreenCard]}
          </Typography>
          <IconButton 
            onClick={() => setFullscreenCard(null)} 
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>
        {content}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      <BackgroundEffects />
      <FullscreenCardView />
      
      <Container maxWidth="lg">
        <Box sx={{ pt: 10, pb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "Orbitron, sans-serif",
                fontWeight: "bold",
                color: "cyan",
                textShadow: "0px 0px 10px cyan",
                mb: 1
              }}
            >
              Resume Data Insights
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#aad5ff"
              }}
            >
              Your career analytics at a glance
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Skill Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                backgroundColor: 'rgba(10, 25, 41, 0.8)', 
                border: '1px solid rgba(0, 255, 255, 0.1)' 
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: '#ffffff' }}>
                      Skill Distribution
                    </Typography>
                    <IconButton 
                      onClick={() => setFullscreenCard("skills")} 
                      sx={{ color: 'white' }}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    {skillsData && skillsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={skillsData}>
                          <XAxis dataKey="skill" tick={{ fill: '#ffffff' }} />
                          <YAxis tick={{ fill: '#ffffff' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(10, 25, 41, 0.9)', color: '#fff', border: '1px solid cyan' }}
                            formatter={(value) => [`${value} occurrences`, 'Count']}
                            labelFormatter={(value) => `Skill: ${value}`}
                          />
                          <Bar dataKey="count" fill="#8884d8" name="Skill Frequency">
                            {(props) => {
                              const { x, y, width, height, value } = props;
                              return (
                                <g>
                                  <rect x={x} y={y} width={width} height={height} fill="#8884d8" />
                                  {/* Show text inside bar if wide enough */}
                                  {width > 20 && (
                                    <text 
                                      x={x + width / 2} 
                                      y={y + height / 2} 
                                      fill="#ffffff" 
                                      textAnchor="middle" 
                                      dominantBaseline="middle"
                                      fontSize={12}
                                    >
                                      {value}
                                    </text>
                                  )}
                                </g>
                              );
                            }}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body1" sx={{ color: '#ffffff' }}>No skill data available</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Job Match Score Gauge */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                backgroundColor: 'rgba(10, 25, 41, 0.8)', 
                border: '1px solid rgba(0, 255, 255, 0.1)' 
              }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: '#ffffff' }}>
                      Job Match Score
                    </Typography>
                    <IconButton 
                      onClick={() => setFullscreenCard("jobMatch")} 
                      sx={{ color: 'white' }}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <GaugeChart 
                      id="gauge-chart" 
                      nrOfLevels={20} 
                      percent={jobMatchScore / 100} 
                      colors={["#FF5F6D", "#FFC371", "#00C853"]}
                      textColor="#ffffff"
                    />
                    <Typography 
                      variant="h4" 
                      align="center" 
                      sx={{ 
                        mt: 1, 
                        color: jobMatchScore > 75 ? '#00C853' : jobMatchScore > 50 ? '#FFC371' : '#FF5F6D' 
                      }}
                    >
                      {jobMatchScore}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Resume Upload Trends Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                backgroundColor: 'rgba(10, 25, 41, 0.8)', 
                border: '1px solid rgba(0, 255, 255, 0.1)' 
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: '#ffffff' }}>
                      Resume Upload Trends
                    </Typography>
                    <IconButton 
                      onClick={() => setFullscreenCard("uploadTrends")} 
                      sx={{ color: 'white' }}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    {uploadTrends && uploadTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={uploadTrends}>
                          <XAxis 
                            dataKey="date" 
                            tick={{ fill: '#ffffff' }} 
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }}
                          />
                          <YAxis tick={{ fill: '#ffffff' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(10, 25, 41, 0.9)', color: '#fff', border: '1px solid cyan' }}
                            formatter={(value) => [`${value} resumes`, 'Uploads']}
                            labelFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="uploads" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4, fill: '#0a1929' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body1" sx={{ color: '#ffffff' }}>No trend data available</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

           

            {/* Job Roles Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                backgroundColor: 'rgba(10, 25, 41, 0.8)', 
                border: '1px solid rgba(0, 255, 255, 0.1)' 
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: '#ffffff' }}>
                      Job Roles Distribution
                    </Typography>
                    <IconButton 
                      onClick={() => setFullscreenCard("jobRoles")} 
                      sx={{ color: 'white' }}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    {jobRoles && jobRoles.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={jobRoles} 
                            dataKey="percentage" 
                            nameKey="role" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100} 
                            fill="#8884d8" 
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {jobRoles.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body1" sx={{ color: '#ffffff' }}>No job roles data available</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default VisualizationPage;
