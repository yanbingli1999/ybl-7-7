import { Router, Request, Response } from 'express';
import { createStore } from '../storage/fileStore.js';
import { runMonteCarloSimulation } from '../../shared/monteCarlo.js';
import type { SimulationResult, Variable, RunSimulationDto, Project, UpdateSimulationDto } from '../../shared/types.js';

const router = Router();
const simulationsStore = createStore<SimulationResult>('simulations');
const variablesStore = createStore<Variable>('variables');
const projectsStore = createStore<Project>('projects');

router.get('/project/:projectId', (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const sims = simulationsStore
    .filter(s => s.projectId === projectId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(sims);
});

router.get('/:id', (req: Request, res: Response) => {
  const sim = simulationsStore.getById(req.params.id);
  if (!sim) {
    res.status(404).json({ error: '模拟结果不存在' });
    return;
  }
  res.json(sim);
});

router.post('/project/:projectId', (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const project = projectsStore.getById(projectId);
  if (!project) {
    res.status(404).json({ error: '项目不存在' });
    return;
  }

  const variables = variablesStore.filter(v => v.projectId === projectId);
  if (variables.length === 0) {
    res.status(400).json({ error: '请先添加至少一个变量' });
    return;
  }

  const dto = req.body as RunSimulationDto;
  const iterations = Math.max(100, Math.min(100000, Number(dto.iterations) || 10000));
  const threshold = Number(dto.threshold) ?? 0;

  try {
    const result = runMonteCarloSimulation(projectId, variables, {
      iterations,
      threshold,
      runName: dto.runName,
    });

    projectsStore.update(projectId, { updatedAt: new Date().toISOString() });
    const saved = simulationsStore.create(result);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: '模拟执行失败: ' + (error instanceof Error ? error.message : String(error)) });
  }
});

router.patch('/:id', (req: Request, res: Response) => {
  const existing = simulationsStore.getById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: '模拟结果不存在' });
    return;
  }

  const dto = req.body as UpdateSimulationDto;
  const updates: Partial<SimulationResult> = {};
  if (dto.starred !== undefined) updates.starred = dto.starred;
  if (dto.decision !== undefined) updates.decision = dto.decision ?? null;
  if (dto.keyVersion !== undefined) {
    if (dto.keyVersion) {
      const all = simulationsStore.getAll();
      all.forEach((s) => {
        if (s.projectId === existing.projectId && s.id !== existing.id && s.keyVersion) {
          simulationsStore.update(s.id, { keyVersion: false });
        }
      });
    }
    updates.keyVersion = dto.keyVersion;
  }

  const updated = simulationsStore.update(req.params.id, updates);
  res.json(updated);
});

router.delete('/:id', (req: Request, res: Response) => {
  const existing = simulationsStore.getById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: '模拟结果不存在' });
    return;
  }

  simulationsStore.delete(req.params.id);
  res.json({ success: true });
});

export default router;
