import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AppProvider } from './context/AppContext.jsx'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Clerk Publishable Key')
}

// Custom Clerk Text
const clerkLocalization = {
    signIn: {
        start: {
            title: 'Welcome to Bupatara Chiangmai',
            subtitle: 'Sign in to continue your journey with us',
            actionText: 'Don’t have an account?',
            actionLink: 'Sign up',
        },
    },
    signUp: {
        start: {
            title: 'Join Bupatara Chiangmai',
            subtitle: 'Create your account to get started',
        },
    },
}

// Bupatara Soft Glass Theme
const clerkAppearance = {
    variables: {
        colorPrimary: '#9b6b55',
        colorPrimaryForeground: '#ffffff',
        colorForeground: '#493a34',
        colorBackground: 'rgba(255, 253, 250, 0.88)',
        colorInput: 'rgba(255, 255, 255, 0.76)',
        colorInputForeground: '#493a34',
        colorMuted: 'rgba(245, 238, 232, 0.82)',
        colorMutedForeground: '#927f73',
        colorNeutral: '#76564b',
        colorModalBackdrop: 'rgba(48, 37, 31, 0.42)',
        colorDanger: '#bd4c46',
        colorSuccess: '#47845b',
        colorWarning: '#c58b42',
        colorRing: 'rgba(169, 111, 88, 0.35)',
        colorShadow: 'rgba(73, 56, 50, 0.18)',
        borderRadius: '1rem',
        fontFamily: 'Mali, cursive',
        fontFamilyButtons: 'Mali, cursive',
        fontSize: '0.875rem',
    },

    elements: {
        // Modal background
        modalBackdrop: {
            backgroundColor: 'rgba(48, 37, 31, 0.42)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        },

        modalContent: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
        },

        // Main glass card
        card: {
            backgroundColor: 'rgba(255, 253, 250, 0.84)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.78)',
            borderRadius: '26px',
            boxShadow: '0 24px 70px rgba(73, 56, 50, 0.24)',
            overflow: 'hidden',
        },

        headerTitle: {
            color: '#493a34',
            fontFamily: 'Mali, cursive',
            fontWeight: 600,
            letterSpacing: '-0.02em',
        },

        headerSubtitle: {
            color: '#927f73',
            fontFamily: 'Mali, cursive',
        },

        // Form fields
        formFieldLabel: {
            color: '#6e5a50',
            fontWeight: 500,
        },

        formFieldInput: {
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            border: '1px solid rgba(155, 107, 85, 0.22)',
            borderRadius: '14px',
            color: '#493a34',
            boxShadow: 'inset 0 1px 2px rgba(73, 56, 50, 0.04)',
        },

        // Primary button
        formButtonPrimary: {
            background: 'linear-gradient(135deg, #a97861 0%, #805542 100%)',
            color: '#fffaf5',
            borderRadius: '14px',
            boxShadow: '0 10px 22px rgba(128, 85, 66, 0.22)',
            fontFamily: 'Mali, cursive',
            fontWeight: 600,
            '&:hover': {
                filter: 'brightness(1.08)',
            },
        },

        // Social login buttons
        socialButtonsBlockButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.68)',
            border: '1px solid rgba(139, 107, 91, 0.18)',
            borderRadius: '14px',
            color: '#5b493f',
            boxShadow: '0 4px 14px rgba(73, 56, 50, 0.04)',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderColor: 'rgba(155, 107, 85, 0.38)',
            },
        },

        socialButtonsBlockButtonText: {
            color: '#5b493f',
            fontFamily: 'Mali, cursive',
            fontWeight: 500,
        },

        // Divider
        dividerLine: {
            backgroundColor: 'rgba(139, 107, 91, 0.2)',
        },

        dividerText: {
            color: '#9b8a7f',
        },

        // Footer - White text on dark glass
        footer: {
            background: 'linear-gradient(135deg, rgba(111, 79, 64, 0.96), rgba(73, 56, 50, 0.96))',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '18px 20px',
        },

        footerAction: {
            justifyContent: 'center',
        },

        footerActionText: {
            color: '#ffffff',
            fontFamily: 'Mali, cursive',
            fontWeight: 400,
        },

        footerActionLink: {
            color: '#ffffff',
            fontFamily: 'Mali, cursive',
            fontWeight: 700,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            '&:hover': {
                color: '#f2d8c8',
            },
        },

        footerPages: {
            backgroundColor: 'transparent',
        },

        footerPagesLink: {
            color: '#ffffff',
        },

        // Clerk branding
        clerkBranding: {
            filter: 'brightness(0) invert(1)',
            opacity: 0.95,
        },

        clerkBrandingLink: {
            color: '#ffffff',
        },

        // Error messages
        formFieldErrorText: {
            color: '#bd4c46',
        },

        alert: {
            borderRadius: '14px',
        },
    },
}

createRoot(document.getElementById('root')).render(
    <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={clerkAppearance}
        localization={clerkLocalization}
    >
        <BrowserRouter>
            <AppProvider>
                <App />
            </AppProvider>
        </BrowserRouter>
    </ClerkProvider>
)