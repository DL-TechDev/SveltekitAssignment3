<script>
    export let task;
    let isVisible = false;
    let comments = '';

    const closePopup = () => {
        isVisible = false;
    };

    const saveChanges = () => {
        // Implement save functionality here
        console.log("Saved:", comments);
        closePopup();
    };

    const demoteTask = () => {
        // Implement demote functionality here
        console.log("Demoted:", task.name);
        closePopup();
    };

    const promoteTask = () => {
        // Implement promote functionality here
        console.log("Promoted:", task.name);
        closePopup();
    };
</script>

<button on:click={() => isVisible = true} aria-haspopup="dialog">View</button>

{#if isVisible}
    <div class="popup-overlay" on:click={closePopup} role="dialog" aria-labelledby="popup-title" aria-modal="true">
        <div class="popup" on:click|stopPropagation>
            <h2 id="popup-title">{task.name}</h2>
            <textarea bind:value={comments} placeholder="Write your comments here..."></textarea>
            <div class="popup-buttons">
                <button type="button" on:click={closePopup}>Close</button>
                <button type="button" on:click={saveChanges}>Save Changes</button>
                <button type="button" on:click={demoteTask}>Demote</button>
                <button type="button" on:click={promoteTask}>Promote</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000; /* Ensure the popup is above other content */
    }

    .popup {
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 300px; /* Adjust width as needed */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .popup-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
    }

    textarea {
        width: 100%;
        height: 100px;
        margin-top: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px;
    }

    button {
        padding: 8px 12px;
        margin-left: 5px;
        cursor: pointer;
    }
</style>
