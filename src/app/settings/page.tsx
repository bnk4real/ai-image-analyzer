"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

interface Model {
    id: string;
    name: string;
}

const SettingsPage = () => {
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch("/ai-image-analyzer/api/list-models");
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
                const res = await fetch("/ai-image-analyzer/api/saved-model");
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

    const handleSaveModel = async () => {
        setLoading(true);
        try {
            const response = await fetch("/ai-image-analyzer/api/save-model", {
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
        <div className="mx-auto max-w-3xl">
            <PageHeader title="Settings" description="The AI model used for analysis." />

            <div className="space-y-6">
                <section className="card p-6">
                    <h2 className="font-semibold">AI model</h2>
                    <p className="mb-4 mt-1 text-sm text-muted">Select an AI model to use for analysis.</p>
                    <label htmlFor="model" className="label">
                        Model
                    </label>
                    <select
                        id="model"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="input mb-4"
                    >
                        <option value="" disabled>
                            Select a model
                        </option>
                        {models.map((model, index) => (
                            <option key={index} value={model.name}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleSaveModel} disabled={loading || !selectedModel} className="btn-primary">
                        {loading ? "Saving..." : "Save Model"}
                    </button>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
