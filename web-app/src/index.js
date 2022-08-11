import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import './i18n';
import './index.css';

const container = document.getElementById('root');

const root = ReactDOM.createRoot(container);

root.render(
    <BrowserRouter basename="/poli">
        <App />
    </BrowserRouter>
);

