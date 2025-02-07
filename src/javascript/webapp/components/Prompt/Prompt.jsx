import React, {useEffect, useState} from 'react';
import {Avatar, Badge, Box, Button, Card, CardHeader, Divider, Modal, TextField, Typography} from '@mui/material';
import {GoogleGenerativeAI} from '@google/generative-ai';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import {JahiaCtx, StoreCtx} from '../../contexts';
import {useTranslation} from 'react-i18next';
import {assets} from '../../assets/assets';

const orderBox = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    maxHeight: '90vh',
    bgcolor: 'grey.200',
    borderRadius: 1,
    boxShadow: 24,
    p: 4,
    overflowY: 'auto'
};

const Prompt = () => {
    const {t} = useTranslation();
    const {state, dispatch} = React.useContext(StoreCtx);
    const {geminiToken, geminiModel} = React.useContext(JahiaCtx);

    const genAI = new GoogleGenerativeAI(geminiToken);
    const {showPrompt} = state;

    const [messages, setMessages] = useState(() => {
        try {
            const savedMessages = localStorage.getItem('chatMessages');
            return savedMessages ? JSON.parse(savedMessages) : [];
        } catch (error) {
            console.error('Error loading messages from localStorage:', error);
            return [];
        }
    });
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving messages to localStorage:', error);
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) {
            return;
        }

        const newMessage = {text: input, sender: 'user'};
        setMessages(prevMessages => [...prevMessages, newMessage]);

        setInput('');
        setError('');

        try {
            const modelName = geminiModel || 'gemini-pro'; // Use default if missing
            const model = genAI.getGenerativeModel({model: modelName});
            const result = await model.generateContent([input]);
            const response = result.response.text();

            setMessages(prevMessages => [...prevMessages, {text: response, sender: 'ai'}]);
        } catch (error) {
            console.error('Error fetching AI response:', error);
            setError(t('error.ai_overload'));
        }
    };

    const resetMessages = () => {
        setMessages([]);
        localStorage.removeItem('chatMessages');
    };

    const handleClose = () => dispatch({case: 'TOGGLE_SHOW_PROMPT'});

    return (
        <Modal
            open={showPrompt}
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            onClose={handleClose}
        >
            <Box sx={orderBox}>
                <Card sx={{p: 0, mb: 2}}>
                    <CardHeader
                        title={
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Badge>
                                    <Avatar alt="Gemini" src={assets.geminiIcon}/>
                                </Badge>
                                <Typography variant="h5" sx={{color: 'white'}}>
                                    {t('chat.title')}
                                </Typography>
                            </Box>
                        }
                        action={
                            <Button variant="outlined" color="white" size="small" onClick={resetMessages}>
                                <RefreshIcon/> {t('chat.reset')}
                            </Button>
                        }
                        sx={{backgroundColor: 'primary.main', color: 'white', mb: 2}}
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Box sx={{minHeight: 500, maxHeight: 500, overflowY: 'auto', mb: 2}}>
                        {messages.map((msg, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Box key={index}>
                                <Box sx={{display: 'flex', alignItems: 'top', mb: 1, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'}}>
                                    {msg.sender === 'ai' && <Avatar sx={{mr: 1, ml: 2, backgroundColor: 'primary.main'}}><SmartToyIcon/></Avatar>}
                                    <Card sx={{p: 0.8, mr: 2, ml: 2, boxShadow: 0}}>
                                        <Typography sx={{color: 'black'}}>
                                            <ReactMarkdown>{DOMPurify.sanitize(msg.text)}</ReactMarkdown>
                                        </Typography>
                                    </Card>
                                    {msg.sender === 'user' && <Avatar sx={{ml: 1, mr: 2, backgroundColor: 'primary.main'}}><PersonIcon/></Avatar>}
                                </Box>
                                {index < messages.length - 1 && <Divider sx={{my: 2, bgcolor: 'grey.800'}}/>}
                            </Box>
                        ))}
                    </Box>
                </Card>
                <Box sx={{display: 'flex', gap: 1}}>
                    <TextField
                        fullWidth
                        value={input}
                        placeholder={t('chat.placeholder')}
                        onChange={e => setInput(e.target.value)}
                    />
                    <Button variant="contained"
                            sx={{backgroundColor: 'primary.main', color: 'white'}}
                            onClick={sendMessage}
                    ><SendIcon sx={{mr: 1}}/> {t('chat.send')}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default Prompt;
