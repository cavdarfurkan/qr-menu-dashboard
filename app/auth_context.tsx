import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useMemo,
} from "react";

interface AuthContextType {
	accessToken: string | null;
	setAccessToken: (accessToken: string) => void;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	accessToken: null,
	setAccessToken: () => {},
	logout: async () => {},
});

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [token, setToken] = useState<string | null>(() => {
		return localStorage.getItem("accessToken") || null;
	});

	useEffect(() => {
		if (token) {
			localStorage.setItem("accessToken", token);
		} else {
			localStorage.removeItem("accessToken");
		}
	}, [token]);

	const setAccessToken = useCallback((accessToken: string) => {
		setToken(accessToken);
	}, []);

	const logout = useCallback(async () => {
		setToken(null);
		localStorage.removeItem("accessToken");
	}, []);

	const contextValue = useMemo(() => {
		return {
			accessToken: token,
			setAccessToken,
			logout,
		};
	}, [token]);

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
