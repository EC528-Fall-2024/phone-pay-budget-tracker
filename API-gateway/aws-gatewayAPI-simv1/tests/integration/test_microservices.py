#!/usr/bin/env python3

import requests
import json

BASE_URL = 'http://localhost:3000'

def test_transaction_data_analysis():
    print('Testing Transaction Data Analysis Microservice...')
    response = requests.get(f'{BASE_URL}/trans-dataanalysis')
    assert response.status_code == 200, f'Expected status code 200, got {response.status_code}'

    transactions = response.json()
    assert isinstance(transactions, list), 'Expected response to be a list of transactions'
    assert len(transactions) > 0, 'Expected at least one transaction in the list'

    # Check the structure of a transaction
    transaction = transactions[0]
    expected_keys = {'pk', 'sk', 'amount', 'expenseName'}
    assert expected_keys.issubset(transaction.keys()), f'Expected keys {expected_keys} in transaction, got {transaction.keys()}'

    print('Transaction Data Analysis Microservice test passed.')

def test_user_profile_set():
    print('Testing User Profile Microservice - Set Profile...')
    data = {
        'pk': 'user123',
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john.doe@example.com',
        'username': 'johndoe',
        'profilePhoto': 'https://example.com/photo.jpg'
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(f'{BASE_URL}/user-profile-setprofile', headers=headers, data=json.dumps(data))
    assert response.status_code == 200, f'Expected status code 200, got {response.status_code}'

    response_body = response.json()
    assert response_body.get('message') == 'Profile data saved successfully', f"Expected success message, got {response_body}"

    print('User Profile Microservice - Set Profile test passed.')

def test_user_profile_get():
    print('Testing User Profile Microservice - Get Profile...')
    params = {'pk': 'user123'}
    response = requests.get(f'{BASE_URL}/user-profile', params=params)
    assert response.status_code == 200, f'Expected status code 200, got {response.status_code}'

    profile = response.json()
    expected_profile = {
        'pk': 'user123',
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john.doe@example.com',
        'username': 'johndoe',
        'profilePhoto': 'https://example.com/photo.jpg'
    }
    assert profile == expected_profile, f"Expected profile {expected_profile}, got {profile}"

    print('User Profile Microservice - Get Profile test passed.')

def test_notifications():
    print('Testing Notifications Microservice...')
    response = requests.get(f'{BASE_URL}/notifications')
    assert response.status_code == 200, f'Expected status code 200, got {response.status_code}'

    body = response.json()
    expected_message = 'Notifications Microservice Response:'
    assert 'Notifications Microservice Response' in response.text, f"Expected message containing '{expected_message}', got {response.text}"

    notification = body
    assert 'id' in notification and 'message' in notification, f"Expected keys 'id' and 'message' in notification, got {notification.keys()}"

    print('Notifications Microservice test passed.')

def test_authentication():
    print('Testing Authentication Microservice...')
    response = requests.get(f'{BASE_URL}/authentication')
    assert response.status_code == 200, f'Expected status code 200, got {response.status_code}'

    body = response.json()
    expected_message = 'Authentication Microservice Response:'
    assert 'Authentication Microservice Response' in response.text, f"Expected message containing '{expected_message}', got {response.text}"

    auth_item = body
    assert 'id' in auth_item and 'username' in auth_item, f"Expected keys 'id' and 'username' in auth item, got {auth_item.keys()}"

    print('Authentication Microservice test passed.')

def test_admin_control_list_users():
    print('Testing Admin Control Microservice - List All Users...')
    response = requests.get(f'{BASE_URL}/admin-control/users')
    assert response.status_code == 200, f'Expected status code 200, got {response.status_code}'

    users = response.json()
    assert isinstance(users, list), 'Expected response to be a list of users'
    assert len(users) >= 1, 'Expected at least one user in the list'

    # Check the structure of a user
    user = users[0]
    expected_keys = {'pk', 'firstName', 'lastName', 'email', 'username', 'profilePhoto'}
    assert expected_keys.issubset(user.keys()), f'Expected keys {expected_keys} in user, got {user.keys()}'

    print('Admin Control Microservice - List All Users test passed.')

def test_admin_control_get_user():
    print('Testing Admin Control Microservice - Get Specific User...')
    user_id = 'user123'
    response = requests.get(f'{BASE_URL}/admin-control/users/{user_id}')
    assert response.status_code == 200, f'Expected status code 200, got {response.status_code}'

    user = response.json()
    expected_user = {
        'pk': 'user123',
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john.doe@example.com',
        'username': 'johndoe',
        'profilePhoto': 'https://example.com/photo.jpg'
    }
    assert user == expected_user, f"Expected user {expected_user}, got {user}"

    print('Admin Control Microservice - Get Specific User test passed.')

def main():
    try:
        test_user_profile_set()
        test_transaction_data_analysis()
        test_user_profile_get()
        test_notifications()
        test_authentication()
        test_admin_control_list_users()
        test_admin_control_get_user()
        print('All tests passed successfully.')
    except AssertionError as e:
        print(f'Test failed: {e}')
        exit(1)
    except Exception as e:
        print(f'An unexpected error occurred: {e}')
        exit(1)

if __name__ == '__main__':
    main()
