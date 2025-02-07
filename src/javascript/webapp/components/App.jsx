import React from 'react';
import {StoreCtx} from '../contexts';
import {IconButton, Badge, ThemeProvider, Avatar, Tooltip} from '@mui/material';
import theme from './theme';
import Prompt from './Prompt/Prompt';
import {assets} from '../assets/assets';
import {useTranslation} from 'react-i18next';

const btn = {
    position: 'fixed',
    top: '50%',
    right: 0,
    zIndex: 1001,
    padding: 2,
    paddingRight: 1.5,
    borderRadius: '50% 0 0 50%',
    bgcolor: 'grey.200',
    boxShadow: 3,
    '&:hover': {
        bgcolor: 'grey.300',
        color: 'secondary.main'
    }
};
const App = () => {
    const {state, dispatch} = React.useContext(StoreCtx);
    const {
        geminiPrompt
    } = state;
    const {t} = useTranslation();

    const handleShowPrompt = () => dispatch({
        case: 'TOGGLE_SHOW_PROMPT'
    });

    // Variant="dot"
    return (
        <ThemeProvider theme={theme(geminiPrompt ? geminiPrompt.userTheme : {})}>
            <Tooltip arrow title={t('chat.open')}>
                <IconButton
                    aria-label="cart"
                    variant="contained"
                    sx={btn}
                    onClick={handleShowPrompt}
                >
                    <Badge>
                        <Avatar alt="Gemini" src={assets.geminiIcon}/>
                    </Badge>
                </IconButton>
            </Tooltip>
            <Prompt/>
        </ThemeProvider>
    );
};

App.propTypes = {};

export default App;
