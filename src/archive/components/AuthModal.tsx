'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (activeTab === 'register') {
        if (!agreeToPolicy) {
          setError('Необходимо согласиться с политикой конфиденциальности');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Пароли не совпадают');
          return;
        }

        if (formData.password.length < 6) {
          setError('Пароль должен содержать минимум 6 символов');
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          setSuccessMessage('Регистрация успешна! Теперь вы можете войти в систему');
          setActiveTab('login');
          setError('');
          setFormData(prev => ({ ...prev, name: '', confirmPassword: '', password: '' }));
          setAgreeToPolicy(false);
        } else {
          const data = await response.json();
          setError(data.message || 'Ошибка регистрации');
        }
      } else if (activeTab === 'login') {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Неверный email или пароль');
        } else {
          setSuccessMessage('Добро пожаловать!');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } else if (activeTab === 'forgot') {
        const response = await fetch('/api/password/forgot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        });

        if (response.ok) {
          setSuccessMessage('Инструкции по восстановлению пароля отправлены на ваш email');
          setFormData(prev => ({ ...prev, email: '' }));
        } else {
          const data = await response.json();
          setError(data.message || 'Ошибка восстановления пароля');
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'yandex') => {
    setIsLoading(true);
    try {
      await signIn(provider, { 
        callbackUrl: window.location.href 
      });
    } catch (error) {
      console.error('Social auth error:', error);
      setError('Ошибка входа через ' + provider);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setSuccessMessage('');
    setAgreeToPolicy(false);
  };

  const switchTab = (tab: 'login' | 'register' | 'forgot') => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'auth-tab--active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Вход
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'auth-tab--active' : ''}`}
              onClick={() => switchTab('register')}
            >
              Регистрация
            </button>
            {activeTab === 'forgot' && (
              <button className="auth-tab auth-tab--active">
                Восстановление
              </button>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Форма входа */}
            {activeTab === 'login' && (
              <>
                <div className="form-group">
                  <label htmlFor="login-email">Email</label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="Введите email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Пароль</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="Введите пароль"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => switchTab('forgot')}
                    className="text-sm text-[#7C5C27] hover:underline"
                  >
                    Забыли пароль?
                  </button>
                </div>
              </>
            )}

            {/* Форма регистрации */}
            {activeTab === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="register-name">Имя</label>
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="Введите ваше имя"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">Email</label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="Введите email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">Пароль</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="register-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="Введите пароль (минимум 6 символов)"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-confirm-password">Подтвердите пароль</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="register-confirm-password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="Повторите пароль"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreeToPolicy}
                      onChange={(e) => setAgreeToPolicy(e.target.checked)}
                      className="mt-1 flex-shrink-0"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      Я согласен с{' '}
                      <a 
                        href="/privacy-policy" 
                        target="_blank" 
                        className="text-[#7C5C27] hover:underline"
                      >
                        политикой конфиденциальности
                      </a>
                      {' '}и{' '}
                      <a 
                        href="/terms-of-service" 
                        target="_blank" 
                        className="text-[#7C5C27] hover:underline"
                      >
                        условиями использования
                      </a>
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Форма восстановления пароля */}
            {activeTab === 'forgot' && (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Введите ваш email адрес, и мы отправим вам инструкции по восстановлению пароля.
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    type="email"
                    id="forgot-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    placeholder="Введите email"
                  />
                </div>

                <div className="flex justify-start mb-4">
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-sm text-[#7C5C27] hover:underline"
                  >
                    ← Вернуться к входу
                  </button>
                </div>
              </>
            )}

            {/* Сообщения об ошибках и успехе */}
            {error && (
              <div className="error-message mb-4">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={isLoading || (activeTab === 'register' && !agreeToPolicy)}
              className="btn-primary w-full"
            >
              {isLoading ? 'Загрузка...' : 
                activeTab === 'login' ? 'Войти' : 
                activeTab === 'register' ? 'Зарегистрироваться' :
                'Восстановить пароль'}
            </button>
          </form>

          {/* OAuth кнопки (только для входа и регистрации) */}
          {activeTab !== 'forgot' && (
            <>
              <div className="auth-divider">
                <span>или</span>
              </div>

              <div className="oauth-buttons">
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                  className="oauth-button oauth-button--google"
                >
                  <FaGoogle />
                  <span>Войти через Google</span>
                </button>

                <button
                  onClick={() => handleOAuthSignIn('yandex')}
                  disabled={isLoading}
                  className="oauth-button oauth-button--yandex"
                >
                  <span style={{fontSize: "16px", fontWeight: "bold"}}>Я</span>
                  <span>Войти через Яндекс</span>
                </button>
              </div>
            </>
          )}

          {/* Переключение между формами */}
          {activeTab === 'login' && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => switchTab('register')}
                className="text-[#7C5C27] hover:underline"
              >
                Зарегистрироваться
              </button>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="text-[#7C5C27] hover:underline"
              >
                Войти
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
