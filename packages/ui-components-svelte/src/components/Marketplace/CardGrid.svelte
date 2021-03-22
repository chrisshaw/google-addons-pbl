<script>
    import Card from "./Card.svelte";
</script>

<style>
    section {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 1rem;
    }

    @media (min-width: 768px) {
        section {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>

<section id="cards">
    {#each cards as card}
    <Card
      title={project.title}
      industry={project.industry}
      imageUrl={project.imageUrl} />
    {/each}
</section>