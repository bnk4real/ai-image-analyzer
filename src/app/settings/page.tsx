"use client";
import { useEffect, useState } from "react";
import { testDbConnection } from "./actions";

interface Model {
    id: string;
    name: string;
}

const SettingsPage = () => {
    const [dbStatus, setDbStatus] = useState("");
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch("/api/list-models");
                if (!response.ok) {
                    throw new Error("Failed to fetch models");
                }
                const data = await response.json();
                const models = data.models || [];
                setModels(models);
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };

        const load = async () => {
            await fetchModels();

            try {
                const res = await fetch("/api/saved-model");
                if (res.ok) {
                    const json = await res.json();
                    if (json.model && json.model.name) {
                        setSelectedModel(json.model.name);
                    }
                }
            } catch (e) {
                console.error("Error fetching saved model:", e);
            }
        };

        load();
    }, []);

    const handleTestDb = async () => {
        setLoading(true);
        const status = await testDbConnection();
        setDbStatus(status);
        setLoading(false);
    };

    const handleSaveModel = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/save-model", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: selectedModel }),
            });
            if (!response.ok) {
                throw new Error("Failed to save model");
            }
            alert("Model saved successfully!");
        } catch (error) {
            console.error("Error saving model:", error);
            alert("Failed to save model");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Database Connection</h2>
                <p className="text-gray-600 mb-4">
                    Test the connection to your database to ensure it is configured
                    correctly.
                </p>
                <button
                    onClick={handleTestDb}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                >
                    {loading ? "Testing..." : "Test DB Connection"}
                </button>
                {dbStatus && (
                    <p className="mt-4 text-sm font-medium">
                        <strong>Status:</strong> {dbStatus}
                    </p>
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 mt-4">
                <h2 className="text-xl font-semibold mb-2">AI Models</h2>
                <p className="text-gray-600 mb-4">Select an AI model to use for analysis.</p>
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded mb-4"
                >
                    <option value="" disabled>Select a model</option>
                    {models.map((model, index) => (
                        <option key={index} value={model.name}>{model.name}</option>
                    ))}
                </select>
                <button
                    onClick={handleSaveModel}
                    disabled={loading || !selectedModel}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                >
                    {loading ? "Saving..." : "Save Model"}
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
