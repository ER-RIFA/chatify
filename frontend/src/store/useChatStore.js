import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: [],
    isSoundEnabled: JSON.parser(localStorage.getItem("isSoundEnabled")) === true,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get.isSoundEnabled);
        set({ isSoundEnabled: !get().isSoundEnabled });
    },

    setActiveTab: (tab) => set({ activeTab: tab}),
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    getAllContacts: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contatcs");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: true});
        }
    },

    getMyChatPartners: async () => {
        set({ isUsersLaoding: true });
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response.data.emssage);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessagesByUserId: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        const { authUser } = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderI: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true //flag to identify optimistic messages (optional)
        }
        //immediately update the UI  by adding the message
        set({ message: [...messages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: messages.contact(res.data) });
        } catch (error) {
            //remove optimistic message on failure
            set({ messages: messages });
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get();
        if (!isSelectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSlectedUser = newMessage.senderId === selectedUser._id;
            if(!isMessageSentFromSelectedUser) return;

            const currentMessages = get().messages;
            set({ messages: [...currentMessages, newMessage] });

            if (isSoundEnabled) {
                const notificationSound = new Audio("/sounds/notification.mp3");

                notificationSound.currentTime = 0; //reset to start
                notificationSound.play().catch((e) => console.log("Audio play failed:", e));
            }
        });
    },

    unsunbscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },
}));