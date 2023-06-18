
import './VizChatView.css';
import VizChat from "../components/Chat/VizChat";
import { ArrowsRightLeftIcon, PaperAirplaneIcon, TrashIcon } from "@heroicons/react/20/solid";
import {useCallback, useEffect, useState} from "react";
import {Spin} from "antd";
import axios from "axios";


function VizChatView() {
    const [userQuery, setUserQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState([]);

    const [dsId, setDsId] = useState(localStorage.getItem('chat2answer_dsId') || "");
    const [dsIdEditing, setDsIdEditing] = useState(dsId);
    const [showDatasetSelector, setShowDatasetSelector] = useState(dsId === "");

    const [tableColumns, setTableColumns] = useState([]);

    const startQuery = useCallback(() => {
        setLoading(true);
        const latestQuery = {
            role: "user",
            content: userQuery,
        };

        let prevChat = [];
        for (let i = 0; i < chat.length; i++) {
            let currentChatItem = chat[i];
            if (currentChatItem.role === 'user') {
                prevChat.push(currentChatItem);
            } else if (currentChatItem.role === 'assistant' && i === chat.length - 1) {
                if (currentChatItem.content.sql) {
                    prevChat.push({
                        role: 'assistant',
                        content: JSON.stringify({
                            sql: currentChatItem.content.sql,
                            columns: currentChatItem.content.columns
                        })
                    });
                }
            }
        }

        setChat([...chat, latestQuery]);
        axios.post('/biz/chat2answer-query-chatgpt', {
            table_name: dsId,
            columns: tableColumns,
            question: userQuery,
            prev_messages: prevChat
        }).then(res => {
            if (!res.data) {
                setChat([...chat, latestQuery, {
                    role: 'assistant',
                    content: {}
                }]);
            } else {
                setChat([...chat, latestQuery, {
                    role: 'assistant',
                    content: res.data
                }]);
            }
        }).finally(() => {
            setLoading(false);
            setUserQuery("");
        });
    }, [dsId, tableColumns, userQuery, chat]);

    const clearChat = useCallback(() => {
        setChat([]);
    }, []);

    const feedbackHandler = useCallback(
        (messages, mIndex, action) => {
            console.log('received feedback', messages, mIndex, action);
        }, []);

    useEffect(() => {
        if (dsId.trim() === '') {
            return;
        }

        axios.post('/biz/chat2answer-query-columns', { table_name: dsId })
            .then(res => {
                setTableColumns(res.data);
            });
    }, [dsId]);

    return (
        <div className="container mx-auto dark:bg-zinc-900 dark:text-gray-50">
            <div className="text-5xl font-extrabold flex justify-center mt-8">
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                    Chat2Answer
                </h1>

            </div>
            <p className="text-center my-2">
                Make contextual data visualization with Chat Interface from tabular datasets.
            </p>

            <div className="flex right-0 py-8">
                {showDatasetSelector && (<div className="flex">
                    <input
                        type="text"
                        className="block border-0 py-1.5 text-gray-900 dark:text-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900"
                        placeholder="数据集DsID"
                        value={dsIdEditing}
                        onChange={(e) => setDsIdEditing(e.target.value)}
                    />
                    <button
                        type="button"
                        className="flex items-center grow-0 rounded-l-md border border-gray-300 dark:border-gray-500 px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-500 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() =>{
                            if (dsIdEditing.trim() !== "") {
                                localStorage.setItem('chat2answer_dsId', dsIdEditing.trim());
                                setDsId(dsIdEditing.trim());
                                setShowDatasetSelector(false)
                            }}
                        }
                    >设置数据集ID</button>

                </div>)}
                {!showDatasetSelector && (<div className="flex">
                    <div className="flex item-center px-2.5 py-1.5 text-sm">当前数据集: {dsId}</div>
                    <button
                        type="button"
                        className="flex items-center grow-0 rounded-l-md border border-gray-300 dark:border-gray-500 px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-500 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setShowDatasetSelector(true)}
                    >Change<ArrowsRightLeftIcon className="w-4 ml-1" /></button>
                </div>)}
            </div>
            {tableColumns.length > 0 && (
                <div className="flex-col space-between flex-grow">
                    {tableColumns.map((column, index) => (
                        <span key={index}
                            className="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-500">
                            {column.name} ({column.dbType})
                        </span>
                    ))}
                </div>
            )}
            <div className="flex flex-col space-between">
                {chat.length > 0 && (
                    <VizChat
                        messages={chat}
                        onDelete={(message, mIndex) => {
                            if (message.role === "user") {
                                setChat((c) => {
                                    const newChat = [...c];
                                    newChat.splice(mIndex, 2);
                                    return newChat;
                                });
                            } else if (message.role === 'assistant') {
                                setChat((c) => {
                                    const newChat = [...c];
                                    newChat.splice(mIndex - 1, 2);
                                    return newChat;
                                });
                            }
                        }}
                        onUserFeedback={feedbackHandler}
                    />
                )}
            </div>
            {dsId !== '' && (<div className="right-0 py-8 flex">
                <button
                    type="button"
                    className="flex items-center grow-0 rounded-l-md border border-gray-300 dark:border-gray-500 px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-500 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={clearChat}
                >
                    Clear
                    {!loading && <TrashIcon className="w-4 ml-1" />}
                </button>
                <input
                    type="text"
                    className="block w-full border-0 py-1.5 text-gray-900 dark:text-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900"
                    placeholder="what visualization your want to draw from the dataset"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && loading === false && userQuery.length > 0) {
                            startQuery();
                        }
                    }}
                />
                <button
                    type="button"
                    className="flex items-center grow-0 rounded-r-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || userQuery.length === 0}
                    onClick={startQuery}
                >
                    Visualize
                    {!loading && (
                        <PaperAirplaneIcon className="w-4 ml-1" />
                    )}
                    {loading && <Spin />}
                </button>
            </div>)}
        </div>
    )
}

export default VizChatView;