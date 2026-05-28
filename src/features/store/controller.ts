import type { Request, Response } from 'express';
import * as storeService from './service';

export async function getAllStores(_req: Request, res: Response) {
  try {
    const stores = await storeService.getAllStores();
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStoreByName(req: Request, res: Response) {
  try {
    const name = req.params.name as string;
    const store = await storeService.getStoreByName(name);

    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    res.json(store);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createStore(req: Request, res: Response) {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      res.status(400).json({ error: 'name must be lowercase alphanumeric with hyphens only' });
      return;
    }

    const store = await storeService.createStore({ name });
    res.status(201).json(store);
  } catch (error: any) {
    console.error('Create store error:', error);
    if (error.message === 'Store already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateStore(req: Request, res: Response) {
  try {
    const name = req.params.name as string;
    const { isBookingEnabled, isVotingEnabled } = req.body;

    const store = await storeService.updateStore(name, { isBookingEnabled, isVotingEnabled });
    res.json(store);
  } catch (error: any) {
    console.error('Update store error:', error);
    if (error.message === 'Store not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function renameStore(req: Request, res: Response) {
  try {
    const oldName = req.params.name as string;
    const { name: newName } = req.body;

    if (!newName) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(newName)) {
      res.status(400).json({ error: 'name must be lowercase alphanumeric with hyphens only' });
      return;
    }

    const store = await storeService.renameStore(oldName, newName);
    res.json(store);
  } catch (error: any) {
    console.error('Rename store error:', error);
    if (error.message === 'Store not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Store name already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteStore(req: Request, res: Response) {
  try {
    const name = req.params.name as string;
    await storeService.deleteStore(name);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete store error:', error);
    if (error.message === 'Store not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
