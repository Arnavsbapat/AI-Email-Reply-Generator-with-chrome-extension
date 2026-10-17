
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import './App.css';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing the page.
    event?.preventDefault();

    if (loading) return;

    if (!emailContent.trim()) {
      setError('Please enter the original email content.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedReply('');

    try {
      const response = await fetch(
        'http://localhost:8080/api/email/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailContent: emailContent.trim(),
            tone,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || `Request failed with status ${response.status}`
        );
      }

      const reply = await response.text();

      if (!reply.trim()) {
        throw new Error('The server returned an empty reply.');
      }

      setGeneratedReply(reply);
    } catch (err) {
      console.error('Email generation error:', err);

      setError(
        err instanceof TypeError
          ? 'Cannot connect to the backend. Make sure Spring Boot is running on port 8080 and check for CORS errors.'
          : err.message || 'Failed to generate the reply. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedReply);
      setCopied(true);
    } catch (err) {
      console.error('Copy error:', err);
      setError('Could not copy the reply. Please copy it manually.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '2rem', md: '2.75rem' } }}
        >
          Email Reply Generator
        </Typography>

        <Typography color="text.secondary">
          Write better email replies with the help of AI.
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Original Email Content"
            placeholder="Paste the email you received here..."
            value={emailContent}
            onChange={(event) => setEmailContent(event.target.value)}
            disabled={loading}
          />

          <FormControl fullWidth disabled={loading}>
            <InputLabel id="tone-label">Reply Tone</InputLabel>

            <Select
              labelId="tone-label"
              value={tone}
              label="Reply Tone"
              onChange={(event) => setTone(event.target.value)}
            >
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !emailContent.trim()}
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              textTransform: 'none',
            }}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={20}
                  color="inherit"
                  sx={{ mr: 1 }}
                />
                Generating Reply...
              </>
            ) : (
              'Generate Reply'
            )}
          </Button>
        </Box>

        {loading && (
          <Box
            sx={{
              mt: 3,
              textAlign: 'center',
            }}
          >
            <Typography color="text.secondary">
              AI is generating your reply. Please wait...
            </Typography>
          </Box>
        )}

        {generatedReply && (
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mb: 1,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Generated Reply
              </Typography>

              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={handleCopy}
              >
                Copy Reply
              </Button>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {generatedReply}
            </Paper>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message="Reply copied to clipboard"
      />
    </Container>
  );
}

export default App;
