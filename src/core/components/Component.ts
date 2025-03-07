import { Entity } from "../entities/Entity";

export abstract class Component {
  constructor(protected entity: Entity) {}
}
