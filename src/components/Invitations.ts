import { Component, Vue } from 'vue-property-decorator';
import { ApiService } from '@/services/ApiService';
import Errors from '@/components/Errors';
import AppButton from '@/components/forms/AppButton.vue';


@Component({
    components: {
        AppButton,
    },
})
export default class Invitation extends Vue {

    working = false;
    private token: string = null;
    private readonly apiService = new ApiService(this);

    createInvitation(): void {
        this.working = true;
        this.apiService.createInvitation()
            .then(
                response => {
                    this.token = response.data.token;
                },
                () => {
                    Errors.sendError(this, 'Generating an invitation failed.');
                },
            ).finally(() => this.working = false);
    }

    copy(): void {
        if (!navigator.clipboard) {
            Errors.sendError(this, `
                The Clipboard API is not available.
                Please note that the Clipboard API is only available in secure
                contexts (websites secured with TLS).
            `);
            return;
        }

        navigator.clipboard.writeText(this.invitationUrl)
            .then(
                () => {
                    console.log('Text copied.');
                },
                () => {
                    Errors.sendError(this, 'Copying to clipboard failed.');
                },
            );
    }

    get invitationUrl(): string {
        if (!this.token) {
            return null;
        }
        const l = window.location;
        return `${l.protocol}//${l.host}/register/${this.token}`;
    }

}
