import Component from '../Component/Component';
import Bundle from './Bundle';

// type ComponentName = string;

/**
 * Component data used to create each component associated with an enitity
 */

export default function createBundle<T extends Component>(componentInfo: (string | T)[]): Bundle {

    const components = componentInfo.map<Component>((info) => {
        if (typeof info === 'string') {
            return { name: info };
        }

        return info;
    });

    return { components }
}