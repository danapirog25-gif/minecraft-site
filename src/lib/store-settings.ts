import { prisma } from "@/lib/prisma";

const STORE_SETTINGS_ID = "global";

export type StoreSettings = {
  streamActive: boolean;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const settings = await prisma.storeSetting.upsert({
    where: {
      id: STORE_SETTINGS_ID
    },
    update: {},
    create: {
      id: STORE_SETTINGS_ID,
      streamActive: false
    }
  });

  return {
    streamActive: settings.streamActive
  };
}

export async function setStreamActive(streamActive: boolean): Promise<StoreSettings> {
  const settings = await prisma.storeSetting.upsert({
    where: {
      id: STORE_SETTINGS_ID
    },
    update: {
      streamActive
    },
    create: {
      id: STORE_SETTINGS_ID,
      streamActive
    }
  });

  return {
    streamActive: settings.streamActive
  };
}
