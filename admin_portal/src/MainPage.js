import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { Container, Typography, Box, Button, Alert, Grid, Paper } from '@mui/material';
import AWS from 'aws-sdk';

function MainPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch users from Cognito User Pool
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const credentials = await Auth.currentCredentials();
      AWS.config.update({
        region: 'us-east-2', // Ensure this matches your Cognito region
        credentials: credentials,
      });

      const cognitoISP = new AWS.CognitoIdentityServiceProvider();
      const params = {
        UserPoolId: 'us-east-2_wiIIvkrzs',
      };

      const data = await cognitoISP.listUsers(params).promise();
      setUsers(data.Users);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user from Cognito User Pool
  const deleteUser = async (username) => {
    try {
      const credentials = await Auth.currentCredentials();
      AWS.config.update({
        region: 'us-east-2',
        credentials: credentials,
      });

      const cognitoISP = new AWS.CognitoIdentityServiceProvider();
      const params = {
        UserPoolId: 'us-east-2_wiIIvkrzs',
        Username: username,
      };

      await cognitoISP.adminDeleteUser(params).promise();
      setUsers(users.filter((user) => user.Username !== username));
      alert(`User ${username} deleted successfully.`);
    } catch (err) {
      setError(`Failed to delete user ${username}.`);
      console.error(`Error deleting user ${username}:`, err);
    }
  };

  // Delete user from DynamoDB via microservice
  const deleteUserFromApi = async (username) => {
    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();

      const response = await fetch(
        `https://nhuhi7ky83.execute-api.us-east-2.amazonaws.com/Prod/admin-control/users/${username}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to delete user from DynamoDB');
      }

      alert(`User ${username} deleted from DynamoDB successfully.`);
    } catch (error) {
      setError(`Failed to delete user ${username} from DynamoDB.`);
      console.error(`Error deleting user ${username} from DynamoDB:`, error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h3" align="center" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} md={6} key={user.Username}>
            <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6">{user.Username}</Typography>
              <Typography variant="body2" color="textSecondary">
                Status: {user.UserStatus}
              </Typography>
              <Button
                variant="contained"
                color="error"
                sx={{ marginTop: 2 }}
                onClick={async () => {
                  await deleteUser(user.Username);
                  await deleteUserFromApi(user.Username);
                }}
              >
                Delete
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default MainPage;
