import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/app/login';
import SignupScreen from '../../src/app/signup';
import ResetPassScreen from '../../src/app/ResetPass';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockSignUp = jest.fn();
const mockUpdateUser = jest.fn();
const mockAlert = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

jest.mock('lucide-react-native', () => {
  const Icon = () => null;
  return new Proxy(
    {},
    {
      get: () => Icon,
    }
  );
});

jest.mock('../../src/contexts/AppContext', () => ({
  useApp: () => ({}),
}));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
  getCurrentUser: jest.fn(),
}));

async function setTextInputValue(
  getAllTextInputs: () => Parameters<typeof fireEvent.changeText>[0][],
  inputIndex: number,
  value: string
) {
  const inputs = getAllTextInputs();
  await fireEvent.changeText(inputs[inputIndex], value);
}

async function pressLastByText(screen: Awaited<ReturnType<typeof render>>, label: string) {
  const matches = screen.getAllByText(label);
  await fireEvent.press(matches[matches.length - 1]);
}

describe('auth screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(mockAlert);
    (global as any).alert = jest.fn();

    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockUpdateUser.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('login signs in and routes to root', async () => {
    const screen = await render(<LoginScreen />);
    const getAllTextInputs = () => screen.container.queryAll((node) => node.type === 'TextInput');

    await setTextInputValue(getAllTextInputs, 0, 'user@example.com');
    await setTextInputValue(getAllTextInputs, 1, 'Password!1');

    await pressLastByText(screen, 'Login');

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password!1',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('login reset-password modal submits recovery email', async () => {
    const screen = await render(<LoginScreen />);
    const getAllTextInputs = () => screen.container.queryAll((node) => node.type === 'TextInput');

    await setTextInputValue(getAllTextInputs, 0, 'recover@example.com');
    await fireEvent.press(screen.getByText('Forgot Password?'));
    await fireEvent.press(screen.getByText('Send Email'));

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('recover@example.com', {
        redirectTo: 'planable://ResetPass',
      });
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'A reset email has been sent to recover@example.com, make sure to also check your spam folder.'
    );
  });

  test('signup validates and then submits valid account data', async () => {
    const screen = await render(<SignupScreen />);
    const getAllTextInputs = () => screen.container.queryAll((node) => node.type === 'TextInput');

    await pressLastByText(screen, 'Sign Up');
    expect(mockAlert).toHaveBeenCalledWith('Invalid Sign Up Credentials');

    await setTextInputValue(getAllTextInputs, 0, 'newuser');
    await setTextInputValue(getAllTextInputs, 1, 'newuser@example.com');
    await setTextInputValue(getAllTextInputs, 2, 'Password!1');
    await setTextInputValue(getAllTextInputs, 3, 'Password!1');
    await pressLastByText(screen, 'Sign Up');

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password!1',
        options: {
          data: {
            display_name: 'newuser',
          },
        },
      });
    });

    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  test('reset password rejects invalid input and updates when valid', async () => {
    const screen = await render(<ResetPassScreen />);
    const getAllTextInputs = () => screen.container.queryAll((node) => node.type === 'TextInput');

    await pressLastByText(screen, 'Reset Password');
    expect(mockAlert).toHaveBeenCalledWith('Invalid Password');

    await setTextInputValue(getAllTextInputs, 0, 'Valid!123');
    await setTextInputValue(getAllTextInputs, 1, 'Valid!123');
    await pressLastByText(screen, 'Reset Password');

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'Valid!123',
      });
    });

    expect((global as any).alert).toHaveBeenCalledWith('Password updated!');
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
