import { useEffect, useState } from "react";
import socket from "../socket";

const API_URL = "http://localhost:5000";

function Chat() {
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedConversation, setSelectedConversation] =
        useState(null);
    const [messages, setMessages] = useState([]);

    const [message, setMessage] = useState("");
    const [showNewChat, setShowNewChat] = useState(false);

    const [chatType, setChatType] = useState("direct");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState("");

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const token = localStorage.getItem("token");

    let currentUser = null;

    try {
        currentUser = JSON.parse(
            localStorage.getItem("user")
        );
    } catch (error) {
        currentUser = null;
    }

    const currentUserId =
        currentUser?._id || currentUser?.id;

    // Load conversations and users
    useEffect(() => {
        const loadData = async () => {
            try {
                const conversationsResponse =
                    await fetch(
                        `${API_URL}/api/chat/conversations`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                const conversationsData =
                    await conversationsResponse.json();

                if (Array.isArray(conversationsData)) {
                    setConversations(conversationsData);
                } else {
                    console.error(conversationsData);
                }

                const usersResponse =
                    await fetch(
                        `${API_URL}/api/chat/users`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                const usersData =
                    await usersResponse.json();

                if (Array.isArray(usersData)) {
                    setUsers(usersData);
                } else {
                    console.error(usersData);
                }
            } catch (error) {
                console.error(
                    "Failed to load chat data:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Receive messages
    useEffect(() => {
        const handleReceiveMessage = (newMessage) => {
            if (
                String(newMessage.conversation?._id) ===
                String(selectedConversation?._id)
            ) {
                setMessages((previous) => [
                    ...previous,
                    newMessage,
                ]);
            }
        };

        socket.on(
            "receiveMessage",
            handleReceiveMessage
        );

        return () => {
            socket.off(
                "receiveMessage",
                handleReceiveMessage
            );
        };
    }, [selectedConversation]);

    // Open conversation
    const openConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setMessages([]);

        socket.emit(
            "joinConversation",
            conversation._id
        );

        try {
            const response = await fetch(
                `${API_URL}/api/chat/conversations/${conversation._id}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (Array.isArray(data)) {
                setMessages(data);
            } else {
                console.error(data);
            }
        } catch (error) {
            console.error(
                "Failed to load messages:",
                error
            );
        }
    };

    // Select users
    const toggleUser = (userId) => {
        setSelectedUsers((previous) =>
            previous.includes(userId)
                ? previous.filter(
                      (id) => id !== userId
                  )
                : [...previous, userId]
        );
    };

    // Create conversation
    const createConversation = async () => {
        if (
            chatType === "direct" &&
            selectedUsers.length !== 1
        ) {
            alert(
                "Select exactly one user for direct chat."
            );
            return;
        }

        if (
            chatType === "group" &&
            selectedUsers.length < 2
        ) {
            alert(
                "Select at least two users for group chat."
            );
            return;
        }

        if (
            chatType === "group" &&
            !groupName.trim()
        ) {
            alert("Enter a group name.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/chat/conversations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        type: chatType,

                        name:
                            chatType === "group"
                                ? groupName
                                : undefined,

                        participants:
                            selectedUsers,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                        "Failed to create chat"
                );
                return;
            }

            setConversations((previous) => {
                const exists = previous.some(
                    (conversation) =>
                        conversation._id ===
                        data._id
                );

                if (exists) {
                    return previous;
                }

                return [data, ...previous];
            });

            setShowNewChat(false);
            setSelectedUsers([]);
            setGroupName("");

            openConversation(data);
        } catch (error) {
            console.error(
                "Create chat error:",
                error
            );
        }
    };

    // Send message
    const sendMessage = () => {
        if (
            !message.trim() ||
            !selectedConversation ||
            !currentUserId ||
            sending
        ) {
            return;
        }

        setSending(true);

        socket.emit("sendMessage", {
            conversationId:
                selectedConversation._id,

            senderId: currentUserId,

            content: message.trim(),
        });

        setMessage("");

        setTimeout(() => {
            setSending(false);
        }, 300);
    };

    // Conversation name
    const getConversationName = (conversation) => {
        if (conversation.type === "group") {
            return (
                conversation.name ||
                "Group Chat"
            );
        }

        const otherUser =
            conversation.participants?.find(
                (user) =>
                    String(user._id) !==
                    String(currentUserId)
            );

        return (
            otherUser?.name ||
            otherUser?.email ||
            "Direct Chat"
        );
    };

    // Conversation avatar
    const getConversationInitial = (
        conversation
    ) => {
        const name =
            getConversationName(conversation);

        return name
            .charAt(0)
            .toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                        T
                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-slate-800">
                            Task Manager
                        </h1>

                        <p className="hidden sm:block text-xs text-slate-400">
                            Admin Chat
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-slate-700">
                            {currentUser?.name ||
                                currentUser?.email ||
                                "User"}
                        </p>

                        <p className="text-xs text-slate-400">
                            Online
                        </p>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {(
                            currentUser?.name ||
                            currentUser?.email ||
                            "U"
                        )
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                </div>

            </header>

            {/* Chat Area */}
            <main className="p-3 sm:p-5 lg:p-6">

                <div className="max-w-7xl mx-auto">

                    <div className="mb-5">
                        <h2 className="text-2xl font-bold text-slate-800">
                            Messages
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Communicate with users and manage conversations.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex h-[calc(100vh-160px)] min-h-[550px]">

                        {/* Conversations Sidebar */}
                        <aside className="w-[320px] lg:w-[350px] flex-shrink-0 border-r border-slate-200 flex flex-col">

                            {/* Sidebar Header */}
                            <div className="p-4 border-b border-slate-200">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">
                                            Conversations
                                        </h3>

                                        <p className="text-xs text-slate-400 mt-1">
                                            {conversations.length} conversation
                                            {conversations.length !== 1
                                                ? "s"
                                                : ""}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowNewChat(true)
                                        }
                                        className="w-9 h-9 rounded-lg bg-blue-600 text-white text-xl flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                                        title="New chat"
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                            {/* Conversation List */}
                            <div className="flex-1 overflow-y-auto">

                                {loading && (
                                    <div className="p-4 space-y-3">

                                        {[1, 2, 3].map(
                                            (item) => (
                                                <div
                                                    key={item}
                                                    className="flex items-center gap-3 animate-pulse"
                                                >
                                                    <div className="w-11 h-11 bg-slate-200 rounded-full" />

                                                    <div className="flex-1">
                                                        <div className="h-4 bg-slate-200 rounded w-2/3" />

                                                        <div className="h-3 bg-slate-200 rounded w-1/2 mt-2" />
                                                    </div>
                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                                {!loading &&
                                    conversations.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">

                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400">
                                                ◌
                                            </div>

                                            <h4 className="mt-4 font-semibold text-slate-700">
                                                No conversations
                                            </h4>

                                            <p className="mt-1 text-sm text-slate-400">
                                                Start a new conversation to begin chatting.
                                            </p>

                                            <button
                                                onClick={() =>
                                                    setShowNewChat(true)
                                                }
                                                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Start Chat
                                            </button>

                                        </div>
                                    )}

                                {conversations.map(
                                    (conversation) => {

                                        const isSelected =
                                            selectedConversation?._id ===
                                            conversation._id;

                                        return (
                                            <button
                                                key={
                                                    conversation._id
                                                }
                                                onClick={() =>
                                                    openConversation(
                                                        conversation
                                                    )
                                                }
                                                className={`w-full text-left px-4 py-3 border-b border-slate-100 transition ${
                                                    isSelected
                                                        ? "bg-blue-50"
                                                        : "hover:bg-slate-50"
                                                }`}
                                            >

                                                <div className="flex items-center gap-3">

                                                    <div
                                                        className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center font-bold ${
                                                            conversation.type ===
                                                            "group"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : "bg-blue-100 text-blue-700"
                                                        }`}
                                                    >
                                                        {getConversationInitial(
                                                            conversation
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex items-center justify-between gap-2">

                                                            <p
                                                                className={`font-semibold text-sm truncate ${
                                                                    isSelected
                                                                        ? "text-blue-700"
                                                                        : "text-slate-700"
                                                                }`}
                                                            >
                                                                {getConversationName(
                                                                    conversation
                                                                )}
                                                            </p>

                                                        </div>

                                                        <div className="flex items-center gap-2 mt-1">

                                                            <span
                                                                className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                                    conversation.type ===
                                                                    "group"
                                                                        ? "bg-purple-100 text-purple-600"
                                                                        : "bg-slate-100 text-slate-500"
                                                                }`}
                                                            >
                                                                {conversation.type ===
                                                                "group"
                                                                    ? "Group"
                                                                    : "Direct"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                            </button>
                                        );
                                    }
                                )}

                            </div>

                        </aside>

                        {/* Main Chat */}
                        <section className="flex-1 min-w-0 flex flex-col">

                            {/* Chat Header */}
                            <div className="h-[73px] flex-shrink-0 px-5 border-b border-slate-200 flex items-center">

                                {selectedConversation ? (
                                    <div className="flex items-center gap-3">

                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                                selectedConversation.type ===
                                                "group"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {getConversationInitial(
                                                selectedConversation
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-slate-800">
                                                {getConversationName(
                                                    selectedConversation
                                                )}
                                            </h3>

                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {selectedConversation.type ===
                                                "group"
                                                    ? "Group conversation"
                                                    : "Direct conversation"}
                                            </p>
                                        </div>

                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="font-bold text-slate-700">
                                            Select a conversation
                                        </h3>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Choose a chat from the left
                                        </p>
                                    </div>
                                )}

                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">

                                {!selectedConversation && (
                                    <div className="h-full flex flex-col items-center justify-center text-center">

                                        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl">
                                            ◌
                                        </div>

                                        <h3 className="mt-5 text-lg font-bold text-slate-700">
                                            Your messages
                                        </h3>

                                        <p className="mt-2 max-w-sm text-sm text-slate-400">
                                            Select an existing conversation or create a new chat to start messaging.
                                        </p>

                                    </div>
                                )}

                                {selectedConversation &&
                                    messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center">

                                            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-2xl text-slate-400">
                                                💬
                                            </div>

                                            <h3 className="mt-4 font-semibold text-slate-700">
                                                No messages yet
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-400">
                                                Send a message to start the conversation.
                                            </p>

                                        </div>
                                    )}

                                {messages.map((msg) => {

                                    const own =
                                        String(
                                            msg.sender?._id
                                        ) ===
                                        String(
                                            currentUserId
                                        );

                                    return (
                                        <div
                                            key={
                                                msg._id
                                            }
                                            className={`mb-4 flex ${
                                                own
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >

                                            <div
                                                className={`max-w-[75%] sm:max-w-md ${
                                                    own
                                                        ? "items-end"
                                                        : "items-start"
                                                } flex flex-col`}
                                            >

                                                {!own && (
                                                    <span className="text-[11px] font-medium text-slate-400 mb-1 px-1">
                                                        {msg.sender
                                                            ?.name ||
                                                            msg.sender
                                                                ?.email ||
                                                            "User"}
                                                    </span>
                                                )}

                                                <div
                                                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                        own
                                                            ? "bg-blue-600 text-white rounded-br-md"
                                                            : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                                                    }`}
                                                >

                                                    <p className="text-sm leading-6 break-words">
                                                        {
                                                            msg.content
                                                        }
                                                    </p>

                                                    <p
                                                        className={`text-[10px] mt-1 ${
                                                            own
                                                                ? "text-blue-100"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        {msg.createdAt
                                                            ? new Date(
                                                                  msg.createdAt
                                                              ).toLocaleTimeString(
                                                                  [],
                                                                  {
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  }
                                                              )
                                                            : ""}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>

                            {/* Message Input */}
                            {selectedConversation && (
                                <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">

                                    <div className="flex items-end gap-2">

                                        <input
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key ===
                                                    "Enter"
                                                ) {
                                                    sendMessage();
                                                }
                                            }}
                                            placeholder="Write a message..."
                                            className="flex-1 h-11 border border-slate-200 rounded-xl px-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                                        />

                                        <button
                                            onClick={
                                                sendMessage
                                            }
                                            disabled={
                                                !message.trim() ||
                                                sending
                                            }
                                            className="h-11 px-5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            {sending
                                                ? "..."
                                                : "Send"}
                                        </button>

                                    </div>

                                </div>
                            )}

                        </section>

                    </div>

                </div>

            </main>

            {/* New Chat Modal */}
            {showNewChat && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    New Conversation
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Start a direct or group chat
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowNewChat(
                                        false
                                    )
                                }
                                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 text-xl transition"
                            >
                                ×
                            </button>

                        </div>

                        <div className="p-6">

                            {/* Chat Type */}
                            <div className="grid grid-cols-2 gap-3 mb-5">

                                <button
                                    onClick={() => {
                                        setChatType(
                                            "direct"
                                        );
                                        setSelectedUsers(
                                            []
                                        );
                                    }}
                                    className={`p-3 rounded-xl border text-sm font-semibold transition ${
                                        chatType ===
                                        "direct"
                                            ? "bg-blue-50 border-blue-300 text-blue-700"
                                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    Direct Chat
                                </button>

                                <button
                                    onClick={() => {
                                        setChatType(
                                            "group"
                                        );
                                        setSelectedUsers(
                                            []
                                        );
                                    }}
                                    className={`p-3 rounded-xl border text-sm font-semibold transition ${
                                        chatType ===
                                        "group"
                                            ? "bg-purple-50 border-purple-300 text-purple-700"
                                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    Group Chat
                                </button>

                            </div>

                            {/* Group Name */}
                            {chatType === "group" && (
                                <div className="mb-5">

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Group Name
                                    </label>

                                    <input
                                        value={
                                            groupName
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setGroupName(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter group name"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                    />

                                </div>
                            )}

                            {/* Participants */}
                            <div>

                                <div className="flex items-center justify-between mb-2">

                                    <label className="text-sm font-semibold text-slate-700">
                                        Select Participants
                                    </label>

                                    <span className="text-xs text-slate-400">
                                        {selectedUsers.length} selected
                                    </span>

                                </div>

                                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">

                                    {users.length ===
                                        0 && (
                                        <p className="p-5 text-sm text-slate-400 text-center">
                                            No other users found.
                                        </p>
                                    )}

                                    {users.map(
                                        (user) => {

                                            const selected =
                                                selectedUsers.includes(
                                                    user._id
                                                );

                                            return (
                                                <label
                                                    key={
                                                        user._id
                                                    }
                                                    className={`flex items-center gap-3 p-3 border-b border-slate-100 last:border-b-0 cursor-pointer transition ${
                                                        selected
                                                            ? "bg-blue-50"
                                                            : "hover:bg-slate-50"
                                                    }`}
                                                >

                                                    <input
                                                        type={
                                                            chatType ===
                                                            "direct"
                                                                ? "radio"
                                                                : "checkbox"
                                                        }
                                                        name="chatUser"
                                                        checked={
                                                            selected
                                                        }
                                                        onChange={() =>
                                                            chatType ===
                                                            "direct"
                                                                ? setSelectedUsers(
                                                                      [
                                                                          user._id,
                                                                      ]
                                                                  )
                                                                : toggleUser(
                                                                      user._id
                                                                  )
                                                        }
                                                        className="w-4 h-4 accent-blue-600"
                                                    />

                                                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm">
                                                        {(
                                                            user.name ||
                                                            user.email ||
                                                            "U"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="text-sm font-semibold text-slate-700 truncate">
                                                            {user.name ||
                                                                user.email}
                                                        </p>

                                                        <p className="text-xs text-slate-400 truncate">
                                                            {
                                                                user.email
                                                            }{" "}
                                                            •{" "}
                                                            {
                                                                user.role
                                                            }
                                                        </p>

                                                    </div>

                                                </label>
                                            );
                                        }
                                    )}

                                </div>

                            </div>

                            {/* Create Button */}
                            <button
                                onClick={
                                    createConversation
                                }
                                className="w-full mt-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
                            >
                                Create Conversation
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Chat;