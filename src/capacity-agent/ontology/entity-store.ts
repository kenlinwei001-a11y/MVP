/**
 * 实体存储管理
 * 管理所有本体实体的实例数据
 */

import { EntityDefinition } from './entity-definitions';

export interface EntityInstance {
  id: string;
  type: string;
  data: Record<string, any>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface EntityRelation {
  id: string;
  source: string;      // 源实体ID
  target: string;      // 目标实体ID
  type: string;        // 关系类型
  properties?: Record<string, any>;
}

export class EntityStore {
  private instances: Map<string, EntityInstance> = new Map();
  private relations: Map<string, EntityRelation> = new Map();
  private typeIndex: Map<string, Set<string>> = new Map();  // 按类型索引

  // 创建实体实例
  create(type: string, data: Record<string, any>, id?: string): EntityInstance {
    const instanceId = id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const instance: EntityInstance = {
      id: instanceId,
      type,
      data,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    this.instances.set(instanceId, instance);

    // 更新类型索引
    if (!this.typeIndex.has(type)) {
      this.typeIndex.set(type, new Set());
    }
    this.typeIndex.get(type)!.add(instanceId);

    return instance;
  }

  // 获取实体
  get(id: string): EntityInstance | undefined {
    return this.instances.get(id);
  }

  // 更新实体
  update(id: string, data: Partial<Record<string, any>>): EntityInstance | undefined {
    const instance = this.instances.get(id);
    if (!instance) return undefined;

    instance.data = { ...instance.data, ...data };
    instance.metadata.updatedAt = new Date().toISOString();

    return instance;
  }

  // 删除实体
  delete(id: string): boolean {
    const instance = this.instances.get(id);
    if (!instance) return false;

    // 删除类型索引
    this.typeIndex.get(instance.type)?.delete(id);

    // 删除相关关系
    this.deleteRelationsForEntity(id);

    return this.instances.delete(id);
  }

  // 按类型查询
  findByType(type: string): EntityInstance[] {
    const ids = this.typeIndex.get(type);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.instances.get(id))
      .filter((instance): instance is EntityInstance => instance !== undefined);
  }

  // 按条件查询
  findByCriteria(type: string, criteria: Record<string, any>): EntityInstance[] {
    return this.findByType(type).filter(instance => {
      return Object.entries(criteria).every(([key, value]) => {
        return instance.data[key] === value;
      });
    });
  }

  // 获取所有实体
  getAll(): EntityInstance[] {
    return Array.from(this.instances.values());
  }

  // 创建关系
  createRelation(source: string, target: string, type: string, properties?: Record<string, any>): EntityRelation {
    const relationId = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const relation: EntityRelation = {
      id: relationId,
      source,
      target,
      type,
      properties
    };

    this.relations.set(relationId, relation);
    return relation;
  }

  // 获取实体的关系
  getRelations(entityId: string, direction: 'out' | 'in' | 'both' = 'both', type?: string): EntityRelation[] {
    const result: EntityRelation[] = [];

    this.relations.forEach((relation) => {
      const matchDirection =
        direction === 'both' ? (relation.source === entityId || relation.target === entityId) :
        direction === 'out' ? relation.source === entityId :
        relation.target === entityId;

      const matchType = type ? relation.type === type : true;

      if (matchDirection && matchType) {
        result.push(relation);
      }
    });

    return result;
  }

  // 获取关联实体
  getRelatedEntities(entityId: string, relationType?: string): EntityInstance[] {
    const relations = this.getRelations(entityId, 'both', relationType);
    const relatedIds = relations.map(r =>
      r.source === entityId ? r.target : r.source
    );

    return relatedIds
      .map(id => this.instances.get(id))
      .filter((instance): instance is EntityInstance => instance !== undefined);
  }

  // 删除关系
  deleteRelation(relationId: string): boolean {
    return this.relations.delete(relationId);
  }

  // 删除实体的所有关系
  private deleteRelationsForEntity(entityId: string): void {
    const idsToDelete: string[] = [];
    this.relations.forEach((relation, id) => {
      if (relation.source === entityId || relation.target === entityId) {
        idsToDelete.push(id);
      }
    });
    idsToDelete.forEach(id => this.relations.delete(id));
  }

  // 清空所有数据
  clear(): void {
    this.instances.clear();
    this.relations.clear();
    this.typeIndex.clear();
  }

  // 导出数据
  export(): { instances: EntityInstance[], relations: EntityRelation[] } {
    return {
      instances: this.getAll(),
      relations: Array.from(this.relations.values())
    };
  }

  // 导入数据
  import(data: { instances: EntityInstance[], relations: EntityRelation[] }): void {
    this.clear();

    for (const instance of data.instances) {
      this.instances.set(instance.id, instance);

      if (!this.typeIndex.has(instance.type)) {
        this.typeIndex.set(instance.type, new Set());
      }
      this.typeIndex.get(instance.type)!.add(instance.id);
    }

    for (const relation of data.relations) {
      this.relations.set(relation.id, relation);
    }
  }

  // 获取统计信息
  getStats(): { instances: number, relations: number, types: string[] } {
    return {
      instances: this.instances.size,
      relations: this.relations.size,
      types: Array.from(this.typeIndex.keys())
    };
  }
}

// 全局存储实例
export const entityStore = new EntityStore();
