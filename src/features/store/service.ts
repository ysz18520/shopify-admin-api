import prisma from '../../lib/prisma';

export interface StoreData {
  name: string;
}

export async function getAllStores() {
  return prisma.store.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getStoreByName(name: string) {
  return prisma.store.findUnique({
    where: { name },
  });
}

export async function createStore(data: StoreData) {
  const existing = await prisma.store.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new Error('Store already exists');
  }

  return prisma.store.create({
    data: {
      name: data.name,
    },
  });
}

export async function updateStore(oldName: string, newName: string) {
  const existing = await prisma.store.findUnique({
    where: { name: oldName },
  });

  if (!existing) {
    throw new Error('Store not found');
  }

  // 如果名称没变，直接返回
  if (oldName === newName) {
    return existing;
  }

  // 检查新名称是否已存在
  const nameExists = await prisma.store.findUnique({
    where: { name: newName },
  });

  if (nameExists) {
    throw new Error('Store name already exists');
  }

  // 级联更新所有相关表的 site 字段
  await prisma.$transaction([
    prisma.booking.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.availabilityConfig.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.breakTime.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.holiday.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.store.update({ where: { name: oldName }, data: { name: newName } }),
  ]);

  return prisma.store.findUnique({ where: { name: newName } });
}

export async function deleteStore(name: string) {
  const existing = await prisma.store.findUnique({
    where: { name },
  });

  if (!existing) {
    throw new Error('Store not found');
  }

  // 级联删除相关数据
  await prisma.availabilityConfig.deleteMany({ where: { site: name } });
  await prisma.breakTime.deleteMany({ where: { site: name } });
  await prisma.holiday.deleteMany({ where: { site: name } });
  await prisma.booking.deleteMany({ where: { site: name } });

  await prisma.store.delete({
    where: { name },
  });

  return { success: true };
}
