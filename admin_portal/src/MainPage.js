import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';
import { Container, Typography, List, ListItem, ListItemText, Button, Box, Alert } from '@mui/material';

function MainPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      // Get AWS credentials via Identity Pool
      const credentials = await Auth.currentCredentials();
      AWS.config.update({
        region: 'us-east-2', // Ensure this matches your Cognito region
        credentials: credentials,
      });

      const cognitoISP = new AWS.CognitoIdentityServiceProvider();
      const params = {
        UserPoolId: 'us-east-2_wiIIvkrzs',
      };

      // Fetch users
      const data = await cognitoISP.listUsers(params).promise();
      console.log('Fetched users:', data.Users); // Log the fetched users
      setUsers(data.Users); // Update state with users
    } catch (err) {
      setError('Failed to fetch users.');
      console.error('Error fetching users:', err); // Log error for debugging
    }
  };

  const deleteUser = async (username) => {
    try {
      // Get AWS credentials via Identity Pool
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

      // Delete user
      await cognitoISP.adminDeleteUser(params).promise();
      console.log(`User ${username} deleted successfully.`);

      // Refresh the list of users
      setUsers(users.filter((user) => user.Username !== username));
      alert(`User ${username} deleted successfully.`);
    } catch (err) {
      setError(`Failed to delete user ${username}.`);
      console.error(`Error deleting user ${username}:`, err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        {error && <Alert severity="error" style={{ marginBottom: '20px' }}>{error}</Alert>}
        <List>
          {users.map((user) => (
            <ListItem
              key={user.Username}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <ListItemText primary={user.Username} secondary={`Status: ${user.UserStatus}`} />
              <Button
                variant="contained"
                color="error"
                onClick={() => deleteUser(user.Username)}
              >
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}

export default MainPage;
