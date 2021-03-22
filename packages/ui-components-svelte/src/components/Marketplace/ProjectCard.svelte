<script>
	import Card from './Card.svelte';
	import Chip from '../Chip.svelte';
	export let backgroundImgUrl = 'https://boygeniusreport.files.wordpress.com/2016/11/puppy-dog.jpg?quality=98&strip=all';
	// placeholders
	let tag = 'label';
	let title = 'This is a title';
	let subtitle = 'Subtitle';
</script>

<style>

	:global(.full-width-card) {
		width: 100%;
		/* this didnt work */
		background-repeat: no-repeat;
		background-size: cover;
	}

	:global(.card-tag) {
        color: #fff;
        box-shadow: 0 0.25rem 0.25rem 0 rgba(0, 0, 0, 0.25);
    }

</style>

<Card class="full-width-card" style="{`background-image:linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImgUrl});`}" data-cy-proj-card>
	<span slot="card-metadata"><Chip class="card-tag">{tag}</Chip></span>
	<span slot="card-title">{title}</span>
	<span slot="card-subtitle">{subtitle}</span>
</Card>

