import Component from '../Component/Component';
import Entity from '../Entity/Entity';
import Bundle from './Bundle';

// type ComponentName = string;

/**
 * Component data used to create each component associated with an enitity
 */
// type ComponentInfo<T extends Component> = ComponentName | Omit<T, 'entityId'>;

export default function createBundle<T extends Omit<Component, 'entityId'>>(componentInfo: (string | T)[]): Bundle {
    const entity = new Entity();

    const components = componentInfo.map<Component>((info) => {
        if (typeof info === 'string') {
            return { entityId: entity.id, name: info };
        }

        return {
            ...info,
            entityId: entity.id,
        }
    });

    return {
        entity,
        components,
    }
}