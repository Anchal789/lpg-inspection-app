import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"

interface InteractiveModalProps {
  visible: boolean
  onClose: () => void
  type: "success" | "error" | "warning" | "info"
  title: string
  titleHindi?: string
  message: string
  messageHindi?: string
  onConfirm?: () => void
  confirmText?: string
  confirmTextHindi?: string
  showCancel?: boolean
}

const InteractiveModal: React.FC<InteractiveModalProps> = ({
  visible,
  onClose,
  type,
  title,
  titleHindi,
  message,
  messageHindi,
  onConfirm,
  confirmText = "OK",
  confirmTextHindi = "ठीक है",
  showCancel = false,
}) => {
  const getModalConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "✅",
          color: "#10B981",
          backgroundColor: "#ECFDF5",
        }
      case "error":
        return {
          icon: "❌",
          color: "#EF4444",
          backgroundColor: "#FEF2F2",
        }
      case "warning":
        return {
          icon: "⚠️",
          color: "#F59E0B",
          backgroundColor: "#FFFBEB",
        }
      case "info":
        return {
          icon: "ℹ️",
          color: "#3B82F6",
          backgroundColor: "#EFF6FF",
        }
      default:
        return {
          icon: "ℹ️",
          color: "#6B7280",
          backgroundColor: "#F9FAFB",
        }
    }
  }

  const config = getModalConfig()

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: config.backgroundColor }]}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: config.color }]}>{title}</Text>
            {titleHindi && <Text style={[styles.titleHindi, { color: config.color }]}>{titleHindi}</Text>}

            <Text style={styles.message}>{message}</Text>
            {messageHindi && <Text style={styles.messageHindi}>{messageHindi}</Text>}
          </View>

          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
                <Text style={styles.cancelButtonTextHindi}>रद्द करें</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: config.color },
                showCancel && styles.confirmButtonWithCancel,
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
              <Text style={styles.confirmButtonTextHindi}>{confirmTextHindi}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modal: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  content: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  titleHindi: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#374151",
    lineHeight: 24,
    marginBottom: 4,
  },
  messageHindi: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 20,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  cancelButtonTextHindi: {
    color: "#6B7280",
    fontSize: 12,
    fontStyle: "italic",
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
  },
  confirmButtonWithCancel: {
    flex: 1,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  confirmButtonTextHindi: {
    color: "#FFFFFF",
    fontSize: 12,
    fontStyle: "italic",
  },
})

export default InteractiveModal
