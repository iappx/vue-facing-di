import { OptionBuilder } from 'vue-facing-decorator/src/optionBuilder'
import { Vue } from 'vue-facing-decorator/src'

export class VueBase extends Vue {
    constructor() {
        super({}, undefined)
    }

    public $_initComponent(optionBuilder: OptionBuilder, vueInstance: any) {
        const props = optionBuilder.props
        if (props) {
            Object.keys(props).forEach(key => {
                (this as any)[key] = vueInstance[key]
            })
        }
    }
}
