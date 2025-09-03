"use client";

import { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Alert,
	Modal,
	Image,
	Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import LoadingIndicator from "../../components/Loader";
import ApiService from "../../api/api-service";

const inspectionQuestions = [
	{
		english: "Is Customer aware about 1906?",
		hindi: "क्या ग्राहक 1906 के बारे में जानता है?",
	},
	{
		english: "Is cylinder in upright position?",
		hindi: "क्या सिलेंडर सीधी स्थिति में है?",
	},
	{
		english: "Is Hot Plate on a platform as compared with cylinder?",
		hindi: "क्या हॉट प्लेट सिलेंडर की तुलना में प्लेटफॉर्म पर है?",
	},
	{
		english: "Is there any crack on the connected Suraksha Hose?",
		hindi: "क्या जुड़े हुए सुरक्षा होज़ पर कोई दरार है?",
	},
	{
		english: "Is Suraksha Hose changed during inspection?",
		hindi: "क्या निरीक्षण के दौरान सुरक्षा होज़ बदला गया है?",
	},
	{
		english:
			"Is customer using any other flame device or fuel or SKO in same kitchen?",
		hindi:
			"क्या ग्राहक उसी रसोई में कोई अन्य ज्वाला उपकरण या ईंधन या SKO का उपयोग कर रहा है?",
	},
	{
		english: "Is the DPR in use of same OMC as cylinder?",
		hindi: "क्या DPR सिलेंडर के समान OMC का उपयोग कर रहा है?",
	},
	{
		english: "Is the safety inspection has done?",
		hindi: "क्या सुरक्षा निरीक्षण हो गया है?",
	},
	{
		english: "Is the customer wants to do servicing of the Hot Plate?",
		hindi: "क्या ग्राहक हॉट प्लेट की सर्विसिंग कराना चाहता है?",
	},
	{
		english: "Is hot plate with BSI mark?",
		hindi: "क्या हॉट प्लेट BSI मार्क के साथ है?",
	},
	{
		english: "Does consumer wish to upgrade with Hi-star hotplate?",
		hindi: "क्या उपभोक्ता हाई-स्टार हॉटप्लेट के साथ अपग्रेड करना चाहता है?",
	},
	{
		english: "Does consumer wish for portable kitchen platform?",
		hindi: "क्या उपभोक्ता पोर्टेबल किचन प्लेटफॉर्म चाहता है?",
	},
];

const labels = {
	english: {
		consumerDetails: "Consumer Details",
		consumerName: "Consumer Name",
		consumerNamePlaceholder: "Enter consumer name",
		consumerNumber: "Consumer Number",
		consumerNumberPlaceholder: "Enter consumer number",
		mobileNumber: "Mobile Number",
		mobileNumberPlaceholder: "Enter mobile number",
		address: "Address",
		addressPlaceholder: "Enter complete address",
		safetyInspection: "Safety Inspection",
		kitchenImage: "Kitchen Image",
		takePhoto: "Take Photo",
		selectedProducts: "Selected Products",
		discounts: "Discounts",
		hotPlateExchange: "Hot Plate Exchange",
		otherDiscount: "Other Discount (₹)",
		subtotal: "Subtotal:",
		totalDiscount: "Total Discount:",
		finalTotal: "Final Total:",
		submitInspection: "Submit Inspection",
		submitting: "Submitting...",
		quantity: "Quantity",
		yes: "✓ Yes",
		no: "✗ No",
		surakshaHoseDueDate: "Suraksha Hose Due Date:",
		callConsumer: "Call Consumer",
		doYouWantToCall: "Do you want to call",
		cancel: "Cancel",
		call: "Call",
		language: "Language",
		// Error messages
		consumerNameRequired: "Consumer name is required",
		consumerNameMinLength: "Consumer name must be at least 3 characters",
		consumerNameMaxLength: "Consumer name must not exceed 40 characters",
		consumerNumberRequired: "Consumer number is required",
		consumerNumberMinLength: "Consumer number must be at least 5 characters",
		consumerNumberMaxLength: "Consumer number must not exceed 16 characters",
		consumerNumberOnlyNumbers: "Consumer number must contain only numbers",
		mobileNumberRequired: "Mobile number is required",
		mobileNumberLength: "Mobile number must be exactly 10 digits",
		mobileNumberValid: "Please enter a valid Indian mobile number",
		addressRequired: "Address is required",
		addressMinLength: "Address must be at least 3 characters",
		addressMaxLength: "Address must not exceed 150 characters",
		imageRequired: "Image is required",
		permissionRequired: "Permission Required",
		cameraPermissionRequired: "Camera permission is required to take photos",
		ok: "OK",
		incompleteForm: "Incomplete Form",
		answerAllQuestions: "Please answer all safety questions",
		validationError: "Validation Error",
		fixAllErrors: "Please fix all errors before submitting",
		insufficientStock: "Insufficient Stock",
		onlyUnitsAvailable:
			"Only {count} units of {product} available. Contact admin to assign more stock.",
		success: "Success",
		inspectionSubmittedSuccessfully: "Inspection submitted successfully!",
		error: "Error",
		failedToSubmitInspection: "Failed to submit inspection. Please try again.",
	},
	hindi: {
		consumerDetails: "उपभोक्ता विवरण",
		consumerName: "उपभोक्ता का नाम",
		consumerNamePlaceholder: "उपभोक्ता का नाम दर्ज करें",
		consumerNumber: "उपभोक्ता संख्या",
		consumerNumberPlaceholder: "उपभोक्ता संख्या दर्ज करें",
		mobileNumber: "मोबाइल नंबर",
		mobileNumberPlaceholder: "मोबाइल नंबर दर्ज करें",
		address: "पता",
		addressPlaceholder: "पूरा पता दर्ज करें",
		safetyInspection: "सुरक्षा निरीक्षण",
		kitchenImage: "रसोई की छवि",
		takePhoto: "फोटो लें",
		selectedProducts: "चयनित उत्पाद",
		discounts: "छूट",
		hotPlateExchange: "हॉट प्लेट एक्सचेंज",
		otherDiscount: "अन्य छूट (₹)",
		subtotal: "उप-योग:",
		totalDiscount: "कुल छूट:",
		finalTotal: "अंतिम योग:",
		submitInspection: "निरीक्षण सबमिट करें",
		submitting: "सबमिट कर रहे हैं...",
		quantity: "मात्रा",
		yes: "✓ हाँ",
		no: "✗ नहीं",
		surakshaHoseDueDate: "सुरक्षा होज़ की नियत तारीख:",
		callConsumer: "उपभोक्ता को कॉल करें",
		doYouWantToCall: "क्या आप कॉल करना चाहते हैं",
		cancel: "रद्द करें",
		call: "कॉल करें",
		language: "भाषा",
		// Error messages
		consumerNameRequired: "उपभोक्ता का नाम आवश्यक है",
		consumerNameMinLength: "उपभोक्ता का नाम कम से कम 3 अक्षरों का होना चाहिए",
		consumerNameMaxLength: "उपभोक्ता का नाम 40 अक्षरों से अधिक नहीं होना चाहिए",
		consumerNumberRequired: "उपभोक्ता संख्या आवश्यक है",
		consumerNumberMinLength: "उपभोक्ता संख्या कम से कम 5 अंकों की होनी चाहिए",
		consumerNumberMaxLength: "उपभोक्ता संख्या 16 अंकों से अधिक नहीं होनी चाहिए",
		consumerNumberOnlyNumbers: "उपभोक्ता संख्या में केवल संख्याएं होनी चाहिए",
		mobileNumberRequired: "मोबाइल नंबर आवश्यक है",
		mobileNumberLength: "मोबाइल नंबर बिल्कुल 10 अंकों का होना चाहिए",
		mobileNumberValid: "कृपया एक वैध भारतीय मोबाइल नंबर दर्ज करें",
		addressRequired: "पता आवश्यक है",
		addressMinLength: "पता कम से कम 3 अक्षरों का होना चाहिए",
		addressMaxLength: "पता 150 अक्षरों से अधिक नहीं होना चाहिए",
		imageRequired: "छवि आवश्यक है",
		permissionRequired: "अनुमति आवश्यक",
		cameraPermissionRequired: "फोटो लेने के लिए कैमरा अनुमति आवश्यक है",
		ok: "ठीक है",
		incompleteForm: "अधूरा फॉर्म",
		answerAllQuestions: "कृपया सभी सुरक्षा प्रश्नों का उत्तर दें",
		validationError: "सत्यापन त्रुटि",
		fixAllErrors: "सबमिट करने से पहले सभी त्रुटियों को ठीक करें",
		insufficientStock: "अपर्याप्त स्टॉक",
		onlyUnitsAvailable:
			"{product} की केवल {count} इकाइयां उपलब्ध हैं। अधिक स्टॉक असाइन करने के लिए व्यवस्थापक से संपर्क करें।",
		success: "सफलता",
		inspectionSubmittedSuccessfully: "निरीक्षण सफलतापूर्वक सबमिट किया गया!",
		error: "त्रुटि",
		failedToSubmitInspection:
			"निरीक्षण सबमिट करने में असफल। कृपया पुनः प्रयास करें।",
	},
};

const NewInspection = () => {
	const navigation = useNavigation();
	const { addInspection, products, appSettings, deliveryMen, refreshData } =
		useData();
	const { user } = useAuth();

	const [selectedLanguage, setSelectedLanguage] = useState("hindi");
	const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const currentLabels = labels[selectedLanguage];

	const [formData, setFormData] = useState({
		consumerName: "",
		consumerNumber: "",
		mobileNumber: "",
		address: "",
		answers: {} as Record<number, string>,
		image: "",
		selectedProducts: [] as Array<{
			id: string;
			name: string;
			price: number;
			quantity: number;
		}>,
		surakshaHoseDueDate: "" as string | Date | null,
		hotplateExchange: false,
		hotplateQuantity: 1,
		portablePlatformQuantity: 1,
		otherDiscount: 0,
	});

	const [errors, setErrors] = useState({});
	const [showImageModal, setShowImageModal] = useState(false);
	const [loading, setLoading] = useState(false);

	// Validation functions
	const validateConsumerName = (name: string) => {
		if (!name.trim()) return currentLabels.consumerNameRequired;
		if (name.length < 3) return currentLabels.consumerNameMinLength;
		if (name.length > 40) return currentLabels.consumerNameMaxLength;
		return "";
	};

	const validateConsumerNumber = (number: string) => {
		if (!number.trim()) return currentLabels.consumerNumberRequired;
		if (!/^\d+$/.test(number)) return currentLabels.consumerNumberOnlyNumbers;
		if (number.length < 4) return currentLabels.consumerNumberMinLength;
		if (number.length > 16) return currentLabels.consumerNumberMaxLength;
		return "";
	};

	const validateMobileNumber = (mobile: string) => {
		if (!mobile.trim()) return currentLabels.mobileNumberRequired;
		if (mobile.length !== 10) return currentLabels.mobileNumberLength;
		if (!/^[6-9]\d{9}$/.test(mobile)) return currentLabels.mobileNumberValid;
		return "";
	};

	const validateAddress = (address: string) => {
		if (!address.trim()) return currentLabels.addressRequired;
		if (address.length < 3) return currentLabels.addressMinLength;
		if (address.length > 150) return currentLabels.addressMaxLength;
		return "";
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "Select Date";
		return date.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const handleDateChange = (_event: any, date: Date | null) => {
		if (date) {
			setFormData({ ...formData, surakshaHoseDueDate: date });
		}
		setShowDatePicker(false);
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData({ ...formData, [field]: value });

		// Real-time validation
		let error = "";
		switch (field) {
			case "consumerName":
				error = validateConsumerName(value);
				break;
			case "consumerNumber":
				error = validateConsumerNumber(value);
				break;
			case "mobileNumber":
				error = validateMobileNumber(value);
				break;
			case "address":
				error = validateAddress(value);
				break;
		}

		setErrors({ ...errors, [field]: error });
	};

	const handleAnswerChange = (questionIndex: number, value: string) => {
		setFormData((prev) => ({
			...prev,
			answers: {
				...prev.answers,
				[questionIndex]: value,
			},
		}));

		// Auto-add products based on answers
		if (questionIndex === 10 && value === "yes") {
			// Hi-star hotplate
			const hotplateProduct = {
				id: "hotplate_" + Date.now(),
				name: appSettings.hotplateName,
				price: appSettings.hotplatePrice,
				quantity: formData.hotplateQuantity,
			};
			setFormData((prev) => ({
				...prev,
				selectedProducts: [
					...prev.selectedProducts.filter((p) => !p?.id?.includes("hotplate")),
					hotplateProduct,
				],
			}));
		}

		if (questionIndex === 11 && value === "yes") {
			// Portable Platform
			const platformProduct = {
				id: "platform_" + Date.now(),
				name: appSettings.portablePlatformName,
				price: appSettings.portablePlatformPrice,
				quantity: formData.portablePlatformQuantity,
			};
			setFormData((prev) => ({
				...prev,
				selectedProducts: [
					...prev.selectedProducts.filter((p) => !p?.id?.includes("platform")),
					platformProduct,
				],
			}));
		}

		// Remove products if answer changes to no
		if (questionIndex === 10 && value === "no") {
			setFormData((prev) => ({
				...prev,
				selectedProducts: prev.selectedProducts.filter(
					(p) => !p?.id?.includes("hotplate")
				),
			}));
		}

		if (questionIndex === 11 && value === "no") {
			setFormData((prev) => ({
				...prev,
				selectedProducts: prev.selectedProducts.filter(
					(p) => !p?.id?.includes("platform")
				),
			}));
		}
	};

	const openCamera = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

		if (permissionResult.granted === false) {
			Alert.alert(
				currentLabels.permissionRequired,
				currentLabels.cameraPermissionRequired,
				[{ text: currentLabels.ok }]
			);
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: false, // Remove cropping functionality
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setFormData((prev) => ({
				...prev,
				image: result.assets[0].uri,
			}));
			setErrors({ ...errors, image: "" });
		}
	};

	const handleMobilePress = (mobile: string) => {
		Alert.alert(
			currentLabels.callConsumer,
			`${currentLabels.doYouWantToCall} ${mobile}?`,
			[
				{ text: currentLabels.cancel, style: "cancel" },
				{
					text: currentLabels.call,
					onPress: () => Linking.openURL(`tel:${mobile}`),
				},
			]
		);
	};

	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			selectedProducts: deliveryMen
				.find((dm) => dm._id === user?.id)
				?.assignedProducts?.filter((p) => p.quantity > 0)
				.map((p) => ({ ...p, quantity: 0, actualQuantity: p.quantity })),
		}));
	}, [products]);

	const getTotalAmount = () => {
		const subtotal = formData.selectedProducts.reduce(
			(sum, product) => sum + product.price * product.quantity,
			0
		);
		const hotplateDiscount = formData.hotplateExchange
			? appSettings.hotplateExchangeRate
			: 0;
		const total = subtotal - hotplateDiscount - formData.otherDiscount;
		return Math.max(0, total);
	};

	const handleSubmit = async () => {
		// Validate all fields
		const nameError = validateConsumerName(formData.consumerName);
		const numberError = validateConsumerNumber(formData.consumerNumber);
		const mobileError = validateMobileNumber(formData.mobileNumber);
		const addressError = validateAddress(formData.address);

		const newErrors = {
			consumerName: nameError,
			consumerNumber: numberError,
			mobileNumber: mobileError,
			address: addressError,
			image: !formData.image ? currentLabels.imageRequired : "",
		};

		setErrors(newErrors);

		// Check if all questions are answered
		const unansweredQuestions = inspectionQuestions.filter(
			(_, index) => !formData.answers[index]
		);
		if (unansweredQuestions.length > 0) {
			Alert.alert(
				currentLabels.incompleteForm,
				currentLabels.answerAllQuestions,
				[{ text: currentLabels.ok }]
			);
			return;
		}

		if (
			nameError ||
			numberError ||
			mobileError ||
			addressError ||
			!formData.image
		) {
			Alert.alert(currentLabels.validationError, currentLabels.fixAllErrors, [
				{ text: currentLabels.ok },
			]);
			return;
		}

		setLoading(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			let location = { latitude: 0, longitude: 0 };

			if (status === "granted") {
				const currentLocation = await Location.getCurrentPositionAsync({});
				location = {
					latitude: currentLocation.coords.latitude,
					longitude: currentLocation.coords.longitude,
				};
			}

			// Check product stock before submitting
			for (const product of formData.selectedProducts) {
				if (product.quantity > 0) {
					const availableProduct = products?.find((p) => p._id === product._id);
					if (availableProduct) {
						const remainingStock =
							availableProduct.quantity -
							(availableProduct.soldQuantity || 0) -
							(availableProduct.assignedQuantity || 0);
						if (product.quantity > remainingStock) {
							Alert.alert(
								currentLabels.insufficientStock,
								currentLabels.onlyUnitsAvailable
									.replace("{count}", remainingStock.toString())
									.replace("{product}", product.name),
								[{ text: currentLabels.ok }]
							);
							setLoading(false);
							return;
						}
					}
				}
			}

			let uploadedImageUrl = null;

			if (formData.image) {
				try {

					// Upload with proper timeout and error handling
					const uploadResponse = await Promise.race([
						ApiService.uploadImage(formData.image), // Pass URI directly
						new Promise((_, reject) =>
							setTimeout(
								() => reject(new Error("Upload timeout after 30 seconds")),
								30000
							)
						),
					]);

					if (uploadResponse.success && uploadResponse.data?.url) {
						uploadedImageUrl = uploadResponse.data.url;
					} else {
						throw new Error(
							uploadResponse.error || "Upload failed - no URL returned"
						);
					}
				} catch (imageError) {
					console.error("❌ Image upload failed:", imageError);
					Alert.alert(
						currentLabels.error,
						`Failed to upload image: ${imageError.message}`,
						[{ text: currentLabels.ok }]
					);
					setLoading(false);
					return;
				}
			}

			// Prepare inspection data
			const inspection = {
				id: Date.now().toString(),
				consumerName: formData.consumerName,
				consumerNumber: formData.consumerNumber,
				mobileNumber: formData.mobileNumber,
				address: formData.address,
				deliveryManId: user?.id || "",
				deliveryManName: user?.name || "",
				date: new Date().toISOString(),
				answers: formData.answers,
				images: uploadedImageUrl ? [uploadedImageUrl] : [],
				products: formData.selectedProducts.filter((p) => p.quantity > 0),
				totalAmount: getTotalAmount(),
				hotplateExchange: formData.hotplateExchange,
				surakshaHoseDueDate: formData.surakshaHoseDueDate
					? formData.surakshaHoseDueDate instanceof Date
						? formData.surakshaHoseDueDate.toLocaleDateString("en-GB", {
								day: "2-digit",
								month: "short",
								year: "numeric",
						  })
						: formData.surakshaHoseDueDate
					: "",
				otherDiscount: formData.otherDiscount,
				hotplateQuantity: formData.hotplateQuantity,
				location,
			};

			// Submit inspection with timeout
			const submissionResponse = await Promise.race([
				addInspection(inspection),
				new Promise((_, reject) =>
					setTimeout(
						() => reject(new Error("Submission timeout after 30 seconds")),
						30000
					)
				),
			]);

			if (submissionResponse && submissionResponse.success) {
				Alert.alert(
					currentLabels.success,
					currentLabels.inspectionSubmittedSuccessfully,
					[{ text: currentLabels.ok, onPress: () => navigation.goBack() }]
				);
				await refreshData();
			} else {
				Alert.alert(
					currentLabels.error,
					submissionResponse?.error || currentLabels.failedToSubmitInspection,
					[{ text: currentLabels.ok }]
				);
			}
		} catch (error) {
			console.error("Submit inspection error:", error);
			console.error("Error details:", JSON.stringify(error, null, 2));
			Alert.alert(
				currentLabels.error,
				`Failed to submit: ${error.message || error.toString()}`,
				[{ text: currentLabels.ok }]
			);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View>
				<LoadingIndicator />
			</View>
		);
	}
	return (
		<ScrollView style={styles.container}>
			{/* Language Selector */}
			<View style={styles.languageSection}>
				<TouchableOpacity
					style={styles.languageSelector}
					onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
				>
					<Text style={styles.languageLabel}>{currentLabels.language}:</Text>
					<Text style={styles.languageValue}>
						{selectedLanguage === "english" ? "English" : "हिंदी"}
					</Text>
					<Ionicons
						name={showLanguageDropdown ? "chevron-up" : "chevron-down"}
						size={20}
						color='#374151'
					/>
				</TouchableOpacity>

				{showLanguageDropdown && (
					<View style={styles.languageDropdown}>
						<TouchableOpacity
							style={[
								styles.languageOption,
								selectedLanguage === "hindi" && styles.languageOptionSelected,
							]}
							onPress={() => {
								setSelectedLanguage("hindi");
								setShowLanguageDropdown(false);
							}}
						>
							<Text
								style={[
									styles.languageOptionText,
									selectedLanguage === "hindi" &&
										styles.languageOptionTextSelected,
								]}
							>
								हिंदी
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.languageOption,
								selectedLanguage === "english" && styles.languageOptionSelected,
							]}
							onPress={() => {
								setSelectedLanguage("english");
								setShowLanguageDropdown(false);
							}}
						>
							<Text
								style={[
									styles.languageOptionText,
									selectedLanguage === "english" &&
										styles.languageOptionTextSelected,
								]}
							>
								English
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			{/* Consumer Details */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>{currentLabels.consumerDetails}</Text>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>{currentLabels.consumerName} *</Text>
					<TextInput
						style={[styles.input, errors.consumerName && styles.inputError]}
						value={formData.consumerName}
						onChangeText={(text) => handleInputChange("consumerName", text)}
						placeholder={currentLabels.consumerNamePlaceholder}
					/>
					{errors.consumerName ? (
						<Text style={styles.errorText}>{errors.consumerName}</Text>
					) : null}
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>{currentLabels.consumerNumber} *</Text>
					<TextInput
						style={[styles.input, errors.consumerNumber && styles.inputError]}
						value={formData.consumerNumber}
						onChangeText={(text) => {
							// Only allow numeric input
							const numericText = text.replace(/[^0-9]/g, "");
							// Limit to 16 characters
							const limitedText = numericText.slice(0, 16);
							handleInputChange("consumerNumber", limitedText);
						}}
						placeholder={currentLabels.consumerNumberPlaceholder}
						keyboardType='numeric'
						maxLength={16}
					/>
					{errors.consumerNumber ? (
						<Text style={styles.errorText}>{errors.consumerNumber}</Text>
					) : null}
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>{currentLabels.mobileNumber} *</Text>
					<TouchableOpacity
						onPress={() =>
							formData.mobileNumber && handleMobilePress(formData.mobileNumber)
						}
					>
						<TextInput
							style={[styles.input, errors.mobileNumber && styles.inputError]}
							value={formData.mobileNumber}
							onChangeText={(text) => {
								// Only allow numeric input for mobile number
								const numericText = text.replace(/[^0-9]/g, "");
								// Limit to 10 characters
								const limitedText = numericText.slice(0, 10);
								handleInputChange("mobileNumber", limitedText);
							}}
							placeholder={currentLabels.mobileNumberPlaceholder}
							keyboardType='phone-pad'
							maxLength={10}
							editable={true}
						/>
					</TouchableOpacity>
					{errors.mobileNumber ? (
						<Text style={styles.errorText}>{errors.mobileNumber}</Text>
					) : null}
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>{currentLabels.address} *</Text>
					<TextInput
						style={[
							styles.input,
							styles.textArea,
							errors.address && styles.inputError,
						]}
						value={formData.address}
						onChangeText={(text) => handleInputChange("address", text)}
						placeholder={currentLabels.addressPlaceholder}
						multiline
						numberOfLines={3}
					/>
					{errors.address ? (
						<Text style={styles.errorText}>{errors.address}</Text>
					) : null}
				</View>
			</View>

			{/* Safety Questions */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>
					{currentLabels.safetyInspection}
				</Text>
				{inspectionQuestions.map((question, index) => (
					<View key={index} style={styles.questionContainer}>
						<Text style={styles.questionText}>
							{index + 1}. {question[selectedLanguage]}
						</Text>
						<View style={styles.radioContainer}>
							<TouchableOpacity
								style={[
									styles.radioButton,
									formData.answers[index] === "yes" &&
										styles.radioButtonSelected,
								]}
								onPress={() => handleAnswerChange(index, "yes")}
							>
								<Text
									style={[
										styles.radioText,
										formData.answers[index] === "yes" &&
											styles.radioTextSelected,
									]}
								>
									{currentLabels.yes}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.radioButton,
									formData.answers[index] === "no" &&
										styles.radioButtonNotSelected,
								]}
								onPress={() => handleAnswerChange(index, "no")}
							>
								<Text
									style={[
										styles.radioText,
										formData.answers[index] === "no" &&
											styles.radioTextSelected,
									]}
								>
									{currentLabels.no}
								</Text>
							</TouchableOpacity>
						</View>

						{/* Special date picker for question 5 (Suraksha Hose) */}
						{index === 4 && formData.answers[index] === "yes" && (
							<View style={styles.datePickerContainer}>
								<Text style={styles.dateLabel}>
									{currentLabels.surakshaHoseDueDate}
								</Text>
								<TouchableOpacity onPress={() => setShowDatePicker(true)}>
									<Text style={styles.datePickerInput}>
										{formatDate(formData.surakshaHoseDueDate as Date)}
									</Text>
								</TouchableOpacity>
								{showDatePicker && (
									<DateTimePicker
										mode='date'
										value={formData.surakshaHoseDueDate || new Date()}
										onChange={handleDateChange}
									/>
								)}
							</View>
						)}

						{/* Hotplate quantity input */}
						{index === 10 && formData.answers[index] === "yes" && (
							<View style={styles.quantityContainer}>
								<Text style={styles.quantityLabel}>
									{appSettings.hotplateName} {currentLabels.quantity}:
								</Text>
								<TextInput
									style={styles.quantityInput}
									value={formData.hotplateQuantity.toString()}
									onChangeText={(qty) => {
										const quantity = parseInt(qty) || 1;
										setFormData((prev) => ({
											...prev,
											hotplateQuantity: quantity,
										}));
										// Update product in selectedProducts
										const hotplateProduct = {
											id: "hotplate_" + Date.now(),
											name: appSettings.hotplateName,
											price: appSettings.hotplatePrice,
											quantity: quantity,
										};
										setFormData((prev) => ({
											...prev,
											selectedProducts: [
												...prev.selectedProducts.filter(
													(p) => !p.name.includes("hotplate")
												),
												hotplateProduct,
											],
										}));
									}}
									keyboardType='numeric'
								/>
								<Text style={styles.priceText}>
									₹{appSettings.hotplatePrice} each
								</Text>
							</View>
						)}

						{/* Platform quantity input */}
						{index === 11 && formData.answers[index] === "yes" && (
							<View style={styles.quantityContainer}>
								<Text style={styles.quantityLabel}>
									{appSettings.portablePlatformName} {currentLabels.quantity}:
								</Text>
								<TextInput
									style={styles.quantityInput}
									value={formData.portablePlatformQuantity.toString()}
									onChangeText={(qty) => {
										const quantity = parseInt(qty) || 1;
										setFormData((prev) => ({
											...prev,
											portablePlatformQuantity: quantity,
										}));
										// Update product in selectedProducts
										const platformProduct = {
											id: "platform_" + Date.now(),
											name: appSettings.portablePlatformName,
											price: appSettings.portablePlatformPrice,
											quantity: quantity,
										};
										setFormData((prev) => ({
											...prev,
											selectedProducts: [
												...prev.selectedProducts.filter(
													(p) => !p.name.includes("Platform")
												),
												platformProduct,
											],
										}));
									}}
									keyboardType='numeric'
								/>
								<Text style={styles.priceText}>
									₹{appSettings.portablePlatformPrice} each
								</Text>
							</View>
						)}
					</View>
				))}
			</View>

			{/* Kitchen Image */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>{currentLabels.kitchenImage}</Text>
				<TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
					<Ionicons name='camera' size={24} color='#FFFFFF' />
					<Text style={styles.cameraButtonText}>{currentLabels.takePhoto}</Text>
				</TouchableOpacity>
				{errors.image ? (
					<Text style={styles.errorText}>{errors.image}</Text>
				) : null}

				{formData.image && (
					<TouchableOpacity onPress={() => setShowImageModal(true)}>
						<Image
							source={{ uri: formData.image }}
							style={styles.previewImage}
						/>
					</TouchableOpacity>
				)}
			</View>

			{/* Products Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Products</Text>
				{/* Available Products */}
				<Text style={styles.subsectionTitle}>Available Products</Text>
				{formData?.selectedProducts?.map((product, index) => {
					return (
						<View key={index} style={styles.productCard}>
							<View style={styles.productInfo}>
								<Text style={styles.productName}>{product.name}</Text>
								<Text style={styles.productDetails}>
									Price: ₹{product.price} | Min: ₹{product.minPrice} | Stock:{" "}
									{product.actualQuantity}
								</Text>
							</View>
							<View style={styles.productInputs}>
								<TextInput
									style={styles.smallInput}
									placeholder='Qty'
									value={product.quantity.toString() || 0}
									keyboardType='numeric'
									onChangeText={(qty) => {
										if (qty) {
											const quantity = Number.parseInt(qty);
											setFormData((prev) => {
												const updatedProducts = [...prev.selectedProducts];
												updatedProducts[index] = { ...product, quantity };
												return { ...prev, selectedProducts: updatedProducts };
											});
										}
									}}
								/>
							</View>
						</View>
					);
				})}
			</View>
			{/* Products Section */}
			{formData.selectedProducts?.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>
						{currentLabels.selectedProducts}
					</Text>
					{formData.selectedProducts.map((product, index) => (
						<View key={index} style={styles.selectedProductCard}>
							<View style={styles.selectedProductInfo}>
								<Text style={styles.selectedProductName}>{product.name}</Text>
								<Text style={styles.selectedProductDetails}>
									{product.quantity} × ₹{product.price} = ₹
									{product.quantity * product.price}
								</Text>
							</View>
							<TouchableOpacity
								style={styles.removeProductButton}
								onPress={() =>
									setFormData((prev) => ({
										...prev,
										selectedProducts: prev.selectedProducts.filter(
											(p) => p._id !== product._id
										),
									}))
								}
							>
								<Text style={styles.removeProductText}>Remove</Text>
							</TouchableOpacity>
						</View>
					))}

					{/* Discount Section */}
					<View style={styles.discountSection}>
						<Text style={styles.subsectionTitle}>
							{currentLabels.discounts}
						</Text>

						<View style={styles.discountRow}>
							<TouchableOpacity
								style={styles.checkboxContainer}
								onPress={() =>
									setFormData((prev) => ({
										...prev,
										hotplateExchange: !prev.hotplateExchange,
									}))
								}
							>
								<View
									style={[
										styles.checkbox,
										formData.hotplateExchange && styles.checkboxChecked,
									]}
								>
									{formData.hotplateExchange && (
										<Text style={styles.checkboxText}>✓</Text>
									)}
								</View>
								<Text style={styles.checkboxLabel}>
									{currentLabels.hotPlateExchange} (-₹
									{appSettings.hotplateExchangeRate})
								</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>{currentLabels.otherDiscount}</Text>
							<TextInput
								style={styles.input}
								value={formData.otherDiscount.toString()}
								onChangeText={(value) =>
									setFormData((prev) => ({
										...prev,
										otherDiscount: parseFloat(value) || 0,
									}))
								}
								placeholder='0'
								keyboardType='numeric'
							/>
						</View>
					</View>

					<View style={styles.totalContainer}>
						<View style={styles.totalRow}>
							<Text style={styles.totalLabel}>{currentLabels.subtotal}</Text>
							<Text style={styles.totalValue}>
								₹
								{formData.selectedProducts.reduce(
									(sum, product) => sum + product.price * product.quantity,
									0
								)}
							</Text>
						</View>
						{(formData.hotplateExchange || formData.otherDiscount > 0) && (
							<View style={styles.totalRow}>
								<Text style={styles.discountLabel}>
									{currentLabels.totalDiscount}
								</Text>
								<Text style={styles.discountValue}>
									-₹
									{(formData.hotplateExchange
										? appSettings.hotplateExchangeRate
										: 0) + formData.otherDiscount}
								</Text>
							</View>
						)}
						<View style={[styles.totalRow, styles.finalTotalRow]}>
							<Text style={styles.finalTotalLabel}>
								{currentLabels.finalTotal}
							</Text>
							<Text style={styles.finalTotalValue}>₹{getTotalAmount()}</Text>
						</View>
					</View>
				</View>
			)}

			{/* Submit Button */}
			<TouchableOpacity
				style={[styles.submitButton, loading && styles.buttonDisabled]}
				onPress={handleSubmit}
				disabled={loading}
			>
				<Text style={styles.submitButtonText}>
					{loading ? currentLabels.submitting : currentLabels.submitInspection}
				</Text>
			</TouchableOpacity>

			{/* Image Modal */}
			<Modal
				visible={showImageModal}
				animationType='fade'
				transparent={true}
				onRequestClose={() => setShowImageModal(false)}
			>
				<View style={styles.imageModalOverlay}>
					<View style={styles.imageModalContent}>
						<TouchableOpacity
							style={styles.imageModalClose}
							onPress={() => setShowImageModal(false)}
						>
							<Ionicons name='close' size={24} color='#FFFFFF' />
						</TouchableOpacity>
						<Image source={{ uri: formData.image }} style={styles.fullImage} />
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	removeProductButton: {
		backgroundColor: "#EF4444",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	removeProductText: {
		color: "#FFFFFF",
		fontSize: 12,
		fontWeight: "500",
	},
	selectedProductInfo: {
		flex: 1,
	},
	productCard: {
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	productInfo: {
		flex: 1,
	},
	productName: {
		fontSize: 16,
		fontWeight: "500",
		color: "#1F2937",
	},
	productDetails: {
		fontSize: 12,
		color: "#6B7280",
	},
	productInputs: {
		flexDirection: "row",
		gap: 8,
	},
	smallInput: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 6,
		fontSize: 14,
		width: 60,
		textAlign: "center",
	},
	datePickerInput: {
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 15,
	},
	container: {
		flex: 1,
		backgroundColor: "#F8FAFC",
	},
	languageSection: {
		backgroundColor: "#FFFFFF",
		margin: 16,
		marginBottom: 8,
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		position: "relative",
		zIndex: 1000,
	},
	languageSelector: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 8,
	},
	languageLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#374151",
	},
	languageValue: {
		fontSize: 16,
		color: "#2563EB",
		fontWeight: "500",
		flex: 1,
		textAlign: "center",
	},
	languageDropdown: {
		position: "absolute",
		top: "100%",
		left: 16,
		right: 16,
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 8,
		zIndex: 1001,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	languageOption: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	languageOptionSelected: {
		backgroundColor: "#EFF6FF",
	},
	languageOptionText: {
		fontSize: 16,
		color: "#374151",
		textAlign: "center",
	},
	languageOptionTextSelected: {
		color: "#2563EB",
		fontWeight: "600",
	},
	section: {
		backgroundColor: "#FFFFFF",
		margin: 16,
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1F2937",
		marginBottom: 16,
	},
	subsectionTitle: {
		fontSize: 16,
		fontWeight: "500",
		color: "#374151",
		marginBottom: 12,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#374151",
		marginBottom: 6,
	},
	input: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		backgroundColor: "#F9FAFB",
	},
	textArea: {
		height: 80,
		textAlignVertical: "top",
	},
	inputError: {
		borderColor: "#EF4444",
		backgroundColor: "#FEF2F2",
	},
	errorText: {
		color: "#EF4444",
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4,
	},
	questionContainer: {
		marginBottom: 20,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	questionText: {
		fontSize: 14,
		color: "#374151",
		marginBottom: 12,
		lineHeight: 20,
		fontWeight: "500",
	},
	radioContainer: {
		flexDirection: "row",
		gap: 12,
	},
	radioButton: {
		backgroundColor: "#F3F4F6",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: "#D1D5DB",
	},
	radioButtonSelected: {
		backgroundColor: "#10B981",
		borderColor: "#10B981",
	},
	radioButtonNotSelected: {
		backgroundColor: "#FF9099",
		borderColor: "#FF9099",
	},
	radioText: {
		fontSize: 14,
		color: "#374151",
		fontWeight: "500",
	},
	radioTextSelected: {
		color: "#FFFFFF",
	},
	datePickerContainer: {
		marginTop: 12,
		padding: 12,
		backgroundColor: "#FEF3C7",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#F59E0B",
	},
	dateLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#92400E",
		marginBottom: 6,
	},
	dateInput: {
		borderWidth: 1,
		borderColor: "#F59E0B",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
		backgroundColor: "#FFFFFF",
	},
	quantityContainer: {
		marginTop: 12,
		padding: 12,
		backgroundColor: "#EFF6FF",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#DBEAFE",
		flexDirection: "row",
		alignItems: "center",
	},
	quantityLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#1E40AF",
		flex: 1,
	},
	quantityInput: {
		borderWidth: 1,
		borderColor: "#DBEAFE",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
		backgroundColor: "#FFFFFF",
		width: 60,
		textAlign: "center",
		marginHorizontal: 8,
	},
	priceText: {
		fontSize: 12,
		color: "#1E40AF",
		fontWeight: "500",
	},
	cameraButton: {
		backgroundColor: "#2563EB",
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 16,
	},
	cameraButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
	previewImage: {
		width: "100%",
		height: 200,
		borderRadius: 8,
		marginTop: 8,
	},
	selectedProductCard: {
		backgroundColor: "#EFF6FF",
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#DBEAFE",
	},
	selectedProductName: {
		fontSize: 16,
		fontWeight: "500",
		color: "#1F2937",
	},
	selectedProductDetails: {
		fontSize: 14,
		color: "#2563EB",
	},
	discountSection: {
		backgroundColor: "#F0FDF4",
		borderRadius: 12,
		padding: 16,
		marginTop: 16,
		borderWidth: 1,
		borderColor: "#BBF7D0",
	},
	discountRow: {
		marginBottom: 12,
	},
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 2,
		borderColor: "#D1D5DB",
		borderRadius: 4,
		marginRight: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	checkboxChecked: {
		backgroundColor: "#10B981",
		borderColor: "#10B981",
	},
	checkboxText: {
		color: "#FFFFFF",
		fontSize: 12,
		fontWeight: "bold",
	},
	checkboxLabel: {
		fontSize: 14,
		color: "#374151",
		fontWeight: "500",
	},
	totalContainer: {
		backgroundColor: "#F0FDF4",
		borderRadius: 8,
		padding: 16,
		marginTop: 12,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#BBF7D0",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	totalLabel: {
		fontSize: 16,
		color: "#374151",
	},
	totalValue: {
		fontSize: 16,
		color: "#374151",
		fontWeight: "500",
	},
	discountLabel: {
		fontSize: 16,
		color: "#EF4444",
	},
	discountValue: {
		fontSize: 16,
		color: "#EF4444",
		fontWeight: "500",
	},
	finalTotalRow: {
		borderTopWidth: 2,
		borderTopColor: "#10B981",
		paddingTop: 8,
		marginTop: 8,
	},
	finalTotalLabel: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#15803D",
	},
	finalTotalValue: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#15803D",
	},
	submitButton: {
		backgroundColor: "#10B981",
		margin: 16,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 6,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "bold",
	},
	imageModalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.9)",
		justifyContent: "center",
		alignItems: "center",
	},
	imageModalContent: {
		width: "90%",
		height: "80%",
		position: "relative",
	},
	imageModalClose: {
		position: "absolute",
		top: 20,
		right: 20,
		zIndex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		borderRadius: 20,
		padding: 8,
	},
	fullImage: {
		width: "100%",
		height: "100%",
		resizeMode: "contain",
	},
});

export default NewInspection;
