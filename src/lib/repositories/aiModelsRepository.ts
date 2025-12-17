import { prisma } from "@/lib/prisma";

export async function saveModel(name: string) {
    try {
        const existingModel = await prisma.ai_models.findUnique({
            where: { name: name },
        });

        if (existingModel) {
            return existingModel;
        }

        const savedModel = await prisma.ai_models.create({
            data: { name: name },
        });

        return savedModel;
    } catch (error) {
        console.error("Error in saveModel repository:", error);
        throw new Error("Failed to save model");
    }
}

export async function listModels() {
    try {
        const models = await prisma.ai_models.findMany({});
        return models;
    } catch (error) {
        console.error("Error in listModels repository:", error);
        throw new Error("Failed to list models");
    }
}

export async function getModelByName(name: string) {
    try {
        const model = await prisma.ai_models.findUnique({
            where: { name: name },
        });
        return model;
    } catch (error) {
        console.error("Error in getModelByName repository:", error);
        throw new Error("Failed to get model by name");
    }
}

export async function getSavedModel () {
    try {
        const model = await prisma.ai_models.findFirst({
            orderBy: { created_at: 'desc' },
        });
        return model;
    } catch (error) {
        console.error("Error in getSavedModel repository:", error);
        throw new Error("Failed to get saved model");
    }
}

export async function deleteModelByName(name: string) {
    try {
        const deletedModel = await prisma.ai_models.delete({
            where: { name: name },
        });
        return deletedModel;
    } catch (error) {
        console.error("Error in deleteModelByName repository:", error);
        throw new Error("Failed to delete model by name");
    }
}