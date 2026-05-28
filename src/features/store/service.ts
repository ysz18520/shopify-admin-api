import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export interface StoreData {
  name: string;
  isBookingEnabled?: boolean;
  isVotingEnabled?: boolean;
}

export async function getAllStores() {
  return prisma.store.findMany({
    orderBy: { createdAt: 'desc' },
    include: { users: { select: { id: true, username: true, role: true } } },
  });
}

export async function getStoreByName(name: string) {
  return prisma.store.findUnique({
    where: { name },
    include: { users: true },
  });
}

export async function createStore(data: StoreData) {
  const existing = await prisma.store.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new Error('Store already exists');
  }

  // 创建店铺并自动创建同名用户
  const passwordHash = await bcrypt.hash(data.name, 10);

  const store = await prisma.store.create({
    data: {
      name: data.name,
      isBookingEnabled: data.isBookingEnabled ?? false,
      isVotingEnabled: data.isVotingEnabled ?? false,
    },
  });

  await prisma.user.create({
    data: {
      username: data.name,
      password: passwordHash,
      role: 'site',
      site: data.name,
    },
  });

  return prisma.store.findUnique({
    where: { name: data.name },
    include: { users: true },
  });
}

export async function updateStore(name: string, data: Partial<StoreData>) {
  const existing = await prisma.store.findUnique({
    where: { name },
  });

  if (!existing) {
    throw new Error('Store not found');
  }

  const updateData: any = {};
  if (data.isBookingEnabled !== undefined) updateData.isBookingEnabled = data.isBookingEnabled;
  if (data.isVotingEnabled !== undefined) updateData.isVotingEnabled = data.isVotingEnabled;

  return prisma.store.update({
    where: { name },
    data: updateData,
  });
}

export async function renameStore(oldName: string, newName: string) {
  const existing = await prisma.store.findUnique({
    where: { name: oldName },
  });

  if (!existing) {
    throw new Error('Store not found');
  }

  if (oldName === newName) {
    return existing;
  }

  const nameExists = await prisma.store.findUnique({
    where: { name: newName },
  });

  if (nameExists) {
    throw new Error('Store name already exists');
  }

  // 级联更新所有相关表
  await prisma.$transaction([
    prisma.booking.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.availabilityConfig.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.breakTime.deleteMany({ where: { site: oldName } }),
    prisma.holiday.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.design.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.designVote.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.contact.updateMany({ where: { site: oldName }, data: { site: newName } }),
    prisma.user.updateMany({ where: { site: oldName }, data: { site: newName, username: newName } }),
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
  await prisma.designVote.deleteMany({ where: { site: name } });
  await prisma.design.deleteMany({ where: { site: name } });
  await prisma.contact.deleteMany({ where: { site: name } });
  await prisma.availabilityConfig.deleteMany({ where: { site: name } });
  await prisma.breakTime.deleteMany({ where: { site: name } });
  await prisma.holiday.deleteMany({ where: { site: name } });
  await prisma.booking.deleteMany({ where: { site: name } });
  await prisma.user.deleteMany({ where: { site: name } });

  await prisma.store.delete({
    where: { name },
  });

  return { success: true };
}
