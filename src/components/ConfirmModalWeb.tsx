import React from "react";
import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";

interface ConfirmModalWebProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModalWeb: React.FC<ConfirmModalWebProps> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
}) => {
  if (Platform.OS !== "web") return null; // Only render this on Web

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 400,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            {title}
          </Text>
          <Text style={{ marginBottom: 20 }}>{message}</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ color: "gray", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={{ color: "blue", fontSize: 16 }}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModalWeb;
