<script>
    export let title;
    export let subtitle;
    export let tag;
    export let background;
    import Chip from '../Chip.svelte';
    export let classes;
    export { classes as class };
</script>

<style>
    .card {
        display: grid;
        overflow: hidden;
        grid-template-rows: repeat(3, 1fr);
        grid-template-columns: repeat(3, 1fr);
        grid-template-areas: 
            "metadata metadata metadata"                                      
            "empty card-content card-content"
            "empty card-content card-content";                     
        height: 100%;
        width: 100%;
		border-radius: 2rem;
        background-color: #fff;
        transition: box-shadow 0.3s ease-in-out;
    }

    /* Add box shadow to entire card on hover */
    .card:hover {
        box-shadow: 0 0.25rem 0.25rem 0 rgba(0, 0, 0, 0.25);
    }
	
	.card:hover .card-content {
		transform: translateX(-2rem);
	}

    .card-media {
        grid-area: 1 / 1 / -1 / -1;
        grid: 1fr;
    }

    .card-content {
        grid-area: card-content;
        text-indent: 5%;
        transition: var(--transition-settings);
    }

    .card-title {
        transform: translateX(1rem);
        background: #D5EBD5;
        color: black;
        box-shadow: 0 0.25rem 0.25rem 0 rgba(0, 0, 0, 0.25);
    }

    .card-subtitle {
        transform: translate(calc(5 * var(--padding-increment)), 2.5rem);
        background: #673AB7;
        color: white;
        box-shadow: 0 0.25rem 0.25rem 0 rgba(0, 0, 0, 0.25);
    } 

    .card-metadata {
        grid-area: metadata;
        padding: 1rem;
    }

</style>

    <!-- Article tag for card container because each is individual & independent -->
    <article class={`card ${classes}`} data-cy-card>
        
        <div class="card-media">
            <slot name="card-media"></slot>
        </div>

        <!-- Seperate divs allow for customization -->
        <div class="card-metadata">
            <slot name="card-metadata"></slot>
        </div>

        <div class="card-content">
            <h2 class="typo-display card-title"><slot name="card-title"></slot><h2>
            <p class="typo-subtitle card-subtitle"><slot name="card-subtitle"></slot></p>
        </div>

    </article>