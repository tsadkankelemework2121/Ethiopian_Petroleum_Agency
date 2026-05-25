<?php

namespace App\Exceptions;

use Exception;

class ZTrackException extends Exception
{
    /**
     * The response payload if available.
     *
     * @var mixed
     */
    protected $responsePayload;

    /**
     * Create a new ZTrackException instance.
     *
     * @param string $message
     * @param int $code
     * @param mixed $responsePayload
     * @param \Throwable|null $previous
     */
    public function __construct(string $message = "", int $code = 0, $responsePayload = null, \Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->responsePayload = $responsePayload;
    }

    /**
     * Get the API response payload.
     *
     * @return mixed
     */
    public function getResponsePayload()
    {
        return $this->responsePayload;
    }
}
