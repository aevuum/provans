'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
// import { SiYandex } from 'react-icons/si';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      if (activeTab === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Пароли не совпадают');
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
          setActiveTab('login');
          setError('');
          setFormData(prev => ({ ...prev, name: '', confirmPassword: '' }));
        } else {
          const data = await response.json();
          setError(data.message || 'Ошибка регистрации');
        }
      } else {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError('Неверный email или пароль');
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
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
  };

  const switchTab = (tab: 'login' | 'register') => {
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
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === 'register' && (
              <div className="form-group">
                <label htmlFor="name">Имя</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Введите ваше имя"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Введите email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
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

            {activeTab === 'register' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Подтвердите пароль</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="Повторите пароль"
                />
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Загрузка...' : activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

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
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
