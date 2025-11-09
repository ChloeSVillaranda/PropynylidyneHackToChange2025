import { useState } from "react";
import { Box, Container, Grid, Paper, TextField, Typography, Button } from "@mui/material";

export default function ContactSection() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thanks ${formState.name || "there"} — your message was received.`);
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <Box component="section" id="contact" sx={{ bgcolor: "#0b1220", color: "white", py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Contact Us
            </Typography>
            <Typography sx={{ color: "#cbd5e1", mb: 4 }}>
              Need assistance or want to learn more about our services?
              Fill out the form and we'll get back to you.
            </Typography>
            
            <Box component="ul" sx={{ listStyle: "none", p: 0, color: "#94a3b8" }}>
              {[
                { label: "Email", value: "info@dronethechange.example" },
                { label: "Phone", value: "+1 (555) 010-0200" },
                { label: "Office", value: "Command Center, Suite 200" },
              ].map(({ label, value }) => (
                <Box component="li" key={label} sx={{ mb: 2 }}>
                  <strong>{label}:</strong>
                  <Box component="span" sx={{ ml: 2 }}>{value}</Box>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {[
                  { name: "name", label: "Name", type: "text" },
                  { name: "email", label: "Email", type: "email" },
                ].map((field) => (
                  <Grid item xs={12} key={field.name}>
                    <TextField
                      fullWidth
                      required
                      label={field.label}
                      type={field.type}
                      value={formState[field.name as keyof typeof formState]}
                      onChange={(e) => setFormState(s => ({ ...s, [field.name]: e.target.value }))}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Message"
                    value={formState.message}
                    onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ bgcolor: "#0f1724", "&:hover": { bgcolor: "#1a2536" } }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
